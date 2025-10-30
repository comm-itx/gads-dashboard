import React from 'react';
import { LEAD_STATUSES } from '../types';

interface BulkOperationsToolbarProps {
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onBulkDelete: () => void;
  onBulkStatusChange: (status: string) => void;
}

const BulkOperationsToolbar: React.FC<BulkOperationsToolbarProps> = ({
  selectedCount,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  onBulkStatusChange,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 mb-6 animate-slide-in-down backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Selection Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-white font-medium">
            {selectedCount} {selectedCount === 1 ? 'lead' : 'leads'} selected
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {/* Select All */}
          <button
            onClick={onSelectAll}
            className="px-3 py-1.5 text-sm text-white border border-white/30 hover:bg-white/10 rounded-lg transition-colors"
          >
            Select All
          </button>

          {/* Deselect All */}
          <button
            onClick={onDeselectAll}
            className="px-3 py-1.5 text-sm text-white border border-white/30 hover:bg-white/10 rounded-lg transition-colors"
          >
            Deselect All
          </button>

          {/* Status Change Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                onBulkStatusChange(e.target.value);
                e.target.value = ''; // Reset
              }
            }}
            defaultValue=""
            className="px-3 py-1.5 text-sm bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
          >
            <option value="" disabled>Change Status</option>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status} className="bg-[--content-dark] text-white">
                {status}
              </option>
            ))}
          </select>

          {/* Delete Button */}
          <button
            onClick={onBulkDelete}
            className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsToolbar;
