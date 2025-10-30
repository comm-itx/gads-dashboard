/**
 * Cloudflare Worker API for Google Ads Leads Dashboard
 * Provides CRUD operations for leads stored in D1 database
 */

interface Env {
  DB: D1Database;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  time: string;
  page_url: string;
  parsed_at: string;
  status: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

// CORS headers for cross-origin requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle CORS preflight requests
function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Add CORS headers to response
function jsonResponse(data: any, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return handleOptions();
    }

    try {
      // Routes
      // GET /api/leads - Get all leads
      if (path === '/api/leads' && method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM leads ORDER BY created_at DESC'
        ).all();
        return jsonResponse({ leads: results || [] });
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
        return jsonResponse({ lead: results[0] });
      }

      // POST /api/leads - Create new lead(s)
      if (path === '/api/leads' && method === 'POST') {
        const body = await request.json() as { leads: Lead[] };

        if (!body.leads || !Array.isArray(body.leads)) {
          return jsonResponse({ error: 'Invalid request body. Expected { leads: [] }' }, 400);
        }

        const createdLeads = [];

        // Insert each lead
        for (const lead of body.leads) {
          const result = await env.DB.prepare(`
            INSERT INTO leads (
              id, name, email, phone, message, date, time,
              page_url, parsed_at, status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            lead.id,
            lead.name,
            lead.email,
            lead.phone || '',
            lead.message || '',
            lead.date || '',
            lead.time || '',
            lead.page_url || '',
            lead.parsed_at,
            lead.status || 'New',
            lead.notes || ''
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
        const body = await request.json() as Lead;

        const result = await env.DB.prepare(`
          UPDATE leads
          SET name = ?, email = ?, phone = ?, message = ?,
              status = ?, notes = ?, date = ?, time = ?, page_url = ?
          WHERE id = ?
        `).bind(
          body.name,
          body.email,
          body.phone || '',
          body.message || '',
          body.status,
          body.notes || '',
          body.date || '',
          body.time || '',
          body.page_url || '',
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
        const [totalResult, statusResult] = await Promise.all([
          env.DB.prepare('SELECT COUNT(*) as total FROM leads').first(),
          env.DB.prepare('SELECT status, COUNT(*) as count FROM leads GROUP BY status').all()
        ]);

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

    } catch (error: any) {
      console.error('API Error:', error);
      return jsonResponse({
        error: 'Internal server error',
        message: error.message
      }, 500);
    }
  },
};
