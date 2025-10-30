import { Lead } from '../types';

/**
 * Convert leads to CSV format and trigger download
 */
export const exportToCSV = (leads: Lead[], filename: string = 'leads-export.csv') => {
  if (leads.length === 0) {
    alert('No leads to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Status',
    'Priority',
    'Tags',
    'Assigned To',
    'Source',
    'Value',
    'Message',
    'Page URL',
    'Date',
    'Time',
    'Created At',
    'Notes',
  ];

  // Convert leads to CSV rows
  const rows = leads.map(lead => [
    lead.id,
    lead.name,
    lead.email,
    lead.phone,
    lead.status,
    lead.priority || '',
    (lead.tags || []).join('; '),
    lead.assignedTo || '',
    lead.source || '',
    lead.value ? `$${lead.value}` : '',
    `"${(lead.message || '').replace(/"/g, '""')}"`, // Escape quotes
    lead.pageUrl,
    lead.date,
    lead.time,
    lead.createdAt || lead.parsedAt,
    `"${(lead.notes || '').replace(/"/g, '""')}"`, // Escape quotes
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export leads as JSON
 */
export const exportToJSON = (leads: Lead[], filename: string = 'leads-export.json') => {
  if (leads.length === 0) {
    alert('No leads to export');
    return;
  }

  const jsonContent = JSON.stringify(leads, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format date for export filename
 */
export const getExportFilename = (prefix: string = 'leads', format: string = 'csv'): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${prefix}-${year}${month}${day}-${hours}${minutes}.${format}`;
};
