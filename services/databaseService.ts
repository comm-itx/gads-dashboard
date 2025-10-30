/**
 * Database Service - Handles all API calls to Cloudflare Worker
 * Replace localStorage with persistent D1 database storage
 */

import { Lead } from '../types';

// Get API URL from environment variable or use default for local development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

// Debug: Log the API URL being used
console.log('🔍 Database Service - API_URL:', API_URL);
console.log('🔍 Environment check:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD
});

/**
 * Fetch all leads from the database
 */
export const fetchLeads = async (): Promise<Lead[]> => {
  try {
    console.log('📡 Fetching leads from:', `${API_URL}/api/leads`);
    const response = await fetch(`${API_URL}/api/leads`);
    if (!response.ok) {
      throw new Error(`Failed to fetch leads: ${response.statusText}`);
    }
    const data = await response.json();
    return data.leads || [];
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

/**
 * Fetch a single lead by ID
 */
export const fetchLeadById = async (id: string): Promise<Lead | null> => {
  try {
    const response = await fetch(`${API_URL}/api/leads/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch lead: ${response.statusText}`);
    }
    const data = await response.json();
    return data.lead;
  } catch (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }
};

/**
 * Create new leads in the database
 */
export const createLeads = async (leads: Lead[]): Promise<Lead[]> => {
  try {
    console.log('📝 Creating leads - URL:', `${API_URL}/api/leads`);
    console.log('📝 Payload:', { leads });

    const response = await fetch(`${API_URL}/api/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leads }),
    });

    console.log('📝 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('📝 Error response:', errorData);
      throw new Error(errorData.error || `Failed to create leads: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📝 Success response:', data);
    return data.leads || [];
  } catch (error) {
    console.error('❌ Error creating leads:', error);
    throw error;
  }
};

/**
 * Update an existing lead
 */
export const updateLead = async (lead: Lead): Promise<Lead> => {
  try {
    const response = await fetch(`${API_URL}/api/leads/${lead.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      throw new Error(`Failed to update lead: ${response.statusText}`);
    }

    const data = await response.json();
    return data.lead;
  } catch (error) {
    console.error('Error updating lead:', error);
    throw error;
  }
};

/**
 * Delete a lead by ID
 */
export const deleteLead = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/leads/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      if (response.status === 404) return false;
      throw new Error(`Failed to delete lead: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};

/**
 * Get statistics about leads
 */
export const fetchStats = async (): Promise<{ total: number; byStatus: Array<{ status: string; count: number }> }> => {
  try {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
};

/**
 * Health check to verify API is accessible
 */
export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};
