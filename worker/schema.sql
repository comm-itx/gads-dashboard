-- Cloudflare D1 Database Schema for Google Ads Leads Dashboard

-- Drop existing table if exists (for development)
DROP TABLE IF EXISTS leads;

-- Create leads table
CREATE TABLE leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    date TEXT,
    time TEXT,
    page_url TEXT,
    parsed_at TEXT NOT NULL,
    status TEXT DEFAULT 'New',
    notes TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_email ON leads(email);
CREATE INDEX idx_status ON leads(status);
CREATE INDEX idx_created_at ON leads(created_at DESC);
CREATE INDEX idx_parsed_at ON leads(parsed_at DESC);

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_leads_timestamp
AFTER UPDATE ON leads
FOR EACH ROW
BEGIN
    UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
