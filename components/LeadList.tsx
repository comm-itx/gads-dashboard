import React, { useState, useMemo } from 'react';
import { Lead, LeadStatus } from '../types';
import { MailIcon, PhoneIcon, MessageSquareIcon, LinkIcon, Trash2Icon, EyeIcon, UsersIcon, ArrowUpDownIcon } from './icons';

interface LeadListProps {
  leads: Lead[];
  onDeleteLead: (id: string) => void;
  onSelectLead: (lead: Lead) => void;
}

type SortDirection = 'asc' | 'desc';
interface SortConfig {
    key: keyof Lead;
    direction: SortDirection;
}

const statusColorMap: Record<LeadStatus, string> = {
    'New': 'bg-blue-500/20 text-blue-300',
    'Contacted': 'bg-yellow-500/20 text-yellow-300',
    'Qualified': 'bg-indigo-500/20 text-indigo-300',
    'Negotiation': 'bg-purple-500/20 text-purple-300',
    'Won': 'bg-green-500/20 text-green-300',
    'Lost': 'bg-red-500/20 text-red-300',
};

const StatusBadge: React.FC<{ status: LeadStatus }> = ({ status }) => (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColorMap[status] || 'bg-gray-700 text-gray-300'}`}>
        {status}
    </span>
);


const LeadList: React.FC<LeadListProps> = ({ leads, onDeleteLead, onSelectLead }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'parsedAt', direction: 'desc' });

  const sortedAndFilteredLeads = useMemo(() => {
    let sortableItems = [...leads];
    
    sortableItems.sort((a, b) => {
        if (sortConfig.key === 'parsedAt') {
            const dateA = new Date(a.parsedAt).getTime();
            const dateB = new Date(b.parsedAt).getTime();
            if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    if (!searchTerm) return sortableItems;

    return sortableItems.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm, sortConfig]);

  const requestSort = (key: keyof Lead) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    } else if (sortConfig.key === key && sortConfig.direction === 'desc') {
        direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Lead) => {
    if (sortConfig.key !== key) {
        return <ArrowUpDownIcon className="h-4 w-4 ml-2 text-[--text-secondary] opacity-50" />;
    }
    return sortConfig.direction === 'desc' ? '▼' : '▲';
  };


  if (leads.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-[--content-dark] rounded-xl border border-[--border-dark]">
        <UsersIcon className="mx-auto h-12 w-12 text-gray-500" />
        <h3 className="mt-2 text-lg font-medium text-[--text-primary]">No leads yet!</h3>
        <p className="mt-1 text-sm text-[--text-secondary]">Use the form above to add your first lead.</p>
      </div>
    );
  }

  return (
    <div className="bg-[--content-dark] rounded-xl border border-[--border-dark] overflow-hidden">
      <div className="p-6 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[--text-primary]">All Leads ({sortedAndFilteredLeads.length})</h2>
            <p className="text-sm text-[--text-secondary] mt-1">Search, sort, and manage your leads.</p>
          </div>
          <div className="w-full sm:max-w-xs">
            <input 
              type="text"
              placeholder="Search by name, email, etc."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 bg-[--background-dark] border border-[--border-dark] rounded-lg text-[--text-primary] focus:ring-2 focus:ring-[--accent-blue] focus:outline-none transition"
            />
          </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[--border-dark]">
          <thead className="bg-[#2a2a2a]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[--text-secondary] uppercase tracking-wider">S.No.</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[--text-secondary] uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[--text-secondary] uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[--text-secondary] uppercase tracking-wider">Message</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[--text-secondary] uppercase tracking-wider">
                <button onClick={() => requestSort('parsedAt')} className="flex items-center group">
                    Date
                    <span className="ml-2 text-blue-400">{getSortIcon('parsedAt')}</span>
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[--text-secondary] uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[--text-secondary] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[--border-dark]">
            {sortedAndFilteredLeads.map((lead, index) => (
              <tr key={lead.id} className="hover:bg-[#2a2a2a] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[--text-secondary]">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[--text-primary]">{lead.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-[--text-secondary]">
                    <MailIcon className="h-4 w-4 mr-1.5" />
                    <a href={`mailto:${lead.email}`} className="hover:text-[--accent-blue]">{lead.email}</a>
                  </div>
                  <div className="flex items-center text-sm text-[--text-secondary] mt-1">
                    <PhoneIcon className="h-4 w-4 mr-1.5" />
                    <a href={`tel:${lead.phone}`} className="hover:text-[--accent-blue]">{lead.phone}</a>
                  </div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-start text-sm text-[--text-secondary]">
                        <MessageSquareIcon className="h-4 w-4 mr-1.5 flex-shrink-0 mt-0.5" />
                        <p className="truncate w-64" title={lead.message}>{lead.message}</p>
                    </div>
                    <div className="flex items-start text-sm text-[--text-secondary] mt-1">
                        <LinkIcon className="h-4 w-4 mr-1.5 flex-shrink-0 mt-0.5" />
                        <a href={lead.pageUrl} target="_blank" rel="noopener noreferrer" className="truncate w-64 hover:text-[--accent-blue]" title={lead.pageUrl}>{lead.pageUrl}</a>
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[--text-secondary]">
                    {lead.date} at {lead.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-3">
                    <button onClick={() => onSelectLead(lead)} className="text-gray-400 hover:text-blue-400 transition-colors" aria-label="View or Edit lead">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => onDeleteLead(lead.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="Delete lead">
                      <Trash2Icon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadList;