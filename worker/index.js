const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Helper function to convert camelCase to snake_case for database
function toSnakeCase(lead) {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone || '',
    message: lead.message || '',
    date: lead.date || '',
    time: lead.time || '',
    page_url: lead.pageUrl || lead.page_url || '',
    parsed_at: lead.parsedAt || lead.parsed_at || new Date().toISOString(),
    status: lead.status || 'New',
    notes: lead.notes || ''
  };
}

// Helper function to convert snake_case to camelCase for frontend
function toCamelCase(dbLead) {
  return {
    id: dbLead.id,
    name: dbLead.name,
    email: dbLead.email,
    phone: dbLead.phone,
    message: dbLead.message,
    date: dbLead.date,
    time: dbLead.time,
    pageUrl: dbLead.page_url,
    parsedAt: dbLead.parsed_at,
    status: dbLead.status,
    notes: dbLead.notes,
    createdAt: dbLead.created_at,
    updatedAt: dbLead.updated_at
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS') {
      return handleOptions();
    }

    try {
      // GET /api/leads - Get all leads
      if (path === '/api/leads' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM leads ORDER BY created_at DESC'
        ).all();

        const leadsInCamelCase = (results || []).map(toCamelCase);
        return jsonResponse({ leads: leadsInCamelCase });
      }

      // GET /api/leads/:id - Get single lead
      if (path.startsWith('/api/leads/') && method === 'GET') {
        const id = path.split('/').pop();
        const { results } = await env.DB.prepare(
          'SELECT * FROM leads WHERE id = ?'
        ).bind(id).all();

        if (!results || results.length === 0) {
          return jsonResponse({ error: 'Lead not found' }, 404);
        }
        return jsonResponse({ lead: toCamelCase(results[0]) });
      }

      // POST /api/leads - Create new lead(s)
      if (path === '/api/leads' && method === 'POST') {
        const body = await request.json();

        if (!body.leads || !Array.isArray(body.leads)) {
          return jsonResponse({ error: 'Invalid request body. Expected { leads: [] }' }, 400);
        }

        const createdLeads = [];

        for (const lead of body.leads) {
          const dbLead = toSnakeCase(lead);

          const result = await env.DB.prepare(`
            INSERT INTO leads (
              id, name, email, phone, message, date, time,
              page_url, parsed_at, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            dbLead.id,
            dbLead.name,
            dbLead.email,
            dbLead.phone,
            dbLead.message,
            dbLead.date,
            dbLead.time,
            dbLead.page_url,
            dbLead.parsed_at,
            dbLead.status,
            dbLead.notes
          ).run();

          if (result.success) {
            createdLeads.push(lead);
          }
        }

        return jsonResponse({
          success: true,
          count: createdLeads.length,
          leads: createdLeads
        }, 201);
      }

      // PUT /api/leads/:id - Update lead
      if (path.startsWith('/api/leads/') && method === 'PUT') {
        const id = path.split('/').pop();
        const body = await request.json();
        const dbLead = toSnakeCase(body);

        const result = await env.DB.prepare(`
          UPDATE leads
          SET name = ?, email = ?, phone = ?, message = ?,
              status = ?, notes = ?, date = ?, time = ?, page_url = ?
          WHERE id = ?
        `).bind(
          dbLead.name,
          dbLead.email,
          dbLead.phone,
          dbLead.message,
          dbLead.status,
          dbLead.notes,
          dbLead.date,
          dbLead.time,
          dbLead.page_url,
          id
        ).run();

        if (result.success && result.meta.changes > 0) {
          return jsonResponse({ success: true, lead: body });
        } else {
          return jsonResponse({ error: 'Lead not found or not updated' }, 404);
        }
      }

      // DELETE /api/leads/:id - Delete lead
      if (path.startsWith('/api/leads/') && method === 'DELETE') {
        const id = path.split('/').pop();

        const result = await env.DB.prepare(
          'DELETE FROM leads WHERE id = ?'
        ).bind(id).run();

        if (result.success && result.meta.changes > 0) {
          return jsonResponse({ success: true, message: 'Lead deleted' });
        } else {
          return jsonResponse({ error: 'Lead not found' }, 404);
        }
      }

      // GET /api/stats - Get statistics
      if (path === '/api/stats' && method === 'GET') {
        const totalResult = await env.DB.prepare('SELECT COUNT(*) as total FROM leads').first();
        const statusResult = await env.DB.prepare('SELECT status, COUNT(*) as count FROM leads GROUP BY status').all();

        return jsonResponse({
          total: totalResult?.total || 0,
          byStatus: statusResult?.results || []
        });
      }

      // GET /health - Health check
      if (path === '/health' || path === '/') {
        return jsonResponse({
          status: 'ok',
          service: 'Google Ads Leads API',
          timestamp: new Date().toISOString()
        });
      }

      // 404 - Route not found
      return jsonResponse({ error: 'Not found' }, 404);

    } catch (error) {
      console.error('API Error:', error);
      return jsonResponse({
        error: 'Internal server error',
        message: error.message
      }, 500);
    }
  },
};
