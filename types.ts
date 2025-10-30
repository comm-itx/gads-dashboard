export const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];

export const PRIORITY_LEVELS = ['Low', 'Medium', 'High', 'Urgent'] as const;
export type PriorityLevel = typeof PRIORITY_LEVELS[number];

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  time: string;
  pageUrl: string;
  parsedAt: string;
  status: LeadStatus;
  notes: string;
  priority?: PriorityLevel;
  tags?: string[];
  assignedTo?: string;
  source?: string;
  value?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  time: string;
  pageUrl: string;
}


export interface ChartData {
  date: string;
  count: number;
}

export interface AiInsights {
  summary: string;
  suggestions: string[];
}

export type ApiProvider = 'gemini' | 'openai';

export interface ApiConfig {
    provider: ApiProvider;
    apiKey: string;
    model?: string;
}