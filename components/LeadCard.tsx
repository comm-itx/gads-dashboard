import React from 'react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, isSelected, onSelect, onView, onDelete }) => {
  const statusColors = {
    New: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Contacted: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    Qualified: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    Negotiation: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    Won: 'bg-green-500/20 text-green-300 border-green-500/30',
    Lost: 'bg-red-500/20 text-red-300 border-red-500/30',
  };

  const priorityColors = {
    Low: 'bg-gray-500/20 text-gray-300',
    Medium: 'bg-blue-500/20 text-blue-300',
    High: 'bg-orange-500/20 text-orange-300',
    Urgent: 'bg-red-500/20 text-red-300',
  };

  const handleCallClick = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div
      className={`bg-[--content-dark] border ${
        isSelected ? 'border-blue-500' : 'border-[--border-dark]'
      } rounded-xl p-5 hover-lift transition-all animate-fade-in`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(lead.id)}
            className="w-5 h-5 rounded border-[--border-dark] bg-[--background-dark] text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">{lead.name}</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[lead.status]}`}>
                  {lead.status}
                </span>
                {lead.priority && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[lead.priority]}`}>
                    {lead.priority}
                  </span>
                )}
                {lead.tags && lead.tags.length > 0 && lead.tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => onView(lead)}
                className="p-2 text-[--text-secondary] hover:text-white hover:bg-[--background-dark] rounded-lg transition-colors"
                title="View Details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                onClick={() => onDelete(lead.id)}
                className="p-2 text-[--text-secondary] hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <button
              onClick={() => handleEmailClick(lead.email)}
              className="flex items-center gap-2 text-sm text-[--text-secondary] hover:text-blue-400 transition-colors text-left"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{lead.email}</span>
            </button>
            {lead.phone && (
              <button
                onClick={() => handleCallClick(lead.phone)}
                className="flex items-center gap-2 text-sm text-[--text-secondary] hover:text-green-400 transition-colors text-left"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{lead.phone}</span>
              </button>
            )}
          </div>

          {/* Message Preview */}
          {lead.message && (
            <p className="text-sm text-[--text-secondary] line-clamp-2 mb-2">
              {lead.message}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-[--text-secondary] pt-3 border-t border-[--border-dark]">
            <span>{new Date(lead.createdAt || lead.parsedAt).toLocaleDateString()}</span>
            {lead.source && <span className="truncate ml-2">Source: {lead.source}</span>}
            {lead.assignedTo && <span className="truncate ml-2">Assigned: {lead.assignedTo}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
