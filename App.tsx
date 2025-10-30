import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LeadInputForm from './components/LeadInputForm';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LeadModal from './components/LeadModal';
import SettingsModal from './components/SettingsModal';
import PasswordModal from './components/PasswordModal';
import ToastContainer, { ToastMessage } from './components/ToastContainer';
import ConfirmDialog from './components/ConfirmDialog';
import KPIDashboard from './components/KPIDashboard';
import SearchFilters from './components/SearchFilters';
import BulkOperationsToolbar from './components/BulkOperationsToolbar';
import LeadCard from './components/LeadCard';
import EmptyState from './components/EmptyState';
import { Lead, LeadData, LeadStatus, ApiConfig } from './types';
import { parseLeadsWithRegex } from './services/aiService';
import { fetchLeads, createLeads, updateLead, deleteLead as deleteLeadFromDB } from './services/databaseService';
import { exportToCSV, getExportFilename } from './utils/exportUtils';
import { WandSparklesIcon, SettingsIcon } from './components/icons';

const App: React.FC = () => {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    provider: 'gemini',
    apiKey: '',
    model: ''
  });

  // UI State
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast & Confirmations
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Bulk Selection
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Toast management
  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Authentication check
  useEffect(() => {
    const auth = sessionStorage.getItem('dashboard-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  // Load leads from database
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadLeads = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedLeads = await fetchLeads();
        setLeads(fetchedLeads);
      } catch (err: any) {
        console.error("Failed to load leads from database", err);
        setError(err.message || "Failed to load leads");
        addToast('error', 'Failed to load leads from database');
      } finally {
        setIsLoading(false);
      }
    };

    // Load API config
    try {
      const storedApiConfig = localStorage.getItem('ai-api-config');
      if (storedApiConfig) setApiConfig(JSON.parse(storedApiConfig));
    } catch (error) {
      console.error("Failed to load API config", error);
    }

    loadLeads();
  }, [isAuthenticated, addToast]);

  // Filter & Search leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          (lead.phone && lead.phone.toLowerCase().includes(query)) ||
          (lead.message && lead.message.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && lead.status !== statusFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && lead.priority !== priorityFilter) {
        return false;
      }

      return true;
    });
  }, [leads, searchQuery, statusFilter, priorityFilter]);

  // API Config
  const handleSaveApiConfig = useCallback((config: ApiConfig) => {
    setApiConfig(config);
    try {
      localStorage.setItem('ai-api-config', JSON.stringify(config));
      addToast('success', 'API configuration saved');
    } catch (error) {
      console.error("Failed to save API config", error);
      addToast('error', 'Failed to save API configuration');
    }
    setIsSettingsModalOpen(false);
  }, [addToast]);

  // Add Leads
  const handleAddLeads = useCallback(async (text: string) => {
    try {
      const parsedDataArray: LeadData[] = parseLeadsWithRegex(text);

      if (parsedDataArray && parsedDataArray.length > 0) {
        const newLeads: Lead[] = parsedDataArray.map((parsedData, index) => ({
          ...parsedData,
          id: new Date().toISOString() + Math.random() + index,
          parsedAt: new Date().toISOString(),
          status: 'New' as LeadStatus,
          notes: '',
        })).reverse();

        const createdLeads = await createLeads(newLeads);
        setLeads(prevLeads => [...createdLeads, ...prevLeads]);
        addToast('success', `Added ${createdLeads.length} lead(s) successfully`);
      } else {
        throw new Error("Failed to parse lead data");
      }
    } catch (error: any) {
      addToast('error', error.message || 'Failed to add leads');
      throw error;
    }
  }, [addToast]);

  // Delete Lead
  const handleDeleteLead = useCallback(async (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Lead',
      message: 'Are you sure you want to delete this lead? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteLeadFromDB(id);
          setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
          setSelectedLeadIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
          });
          addToast('success', 'Lead deleted successfully');
        } catch (error) {
          console.error("Failed to delete lead", error);
          addToast('error', 'Failed to delete lead');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [addToast]);

  // Update Lead
  const handleUpdateLead = useCallback(async (updatedLead: Lead) => {
    try {
      await updateLead(updatedLead);
      setLeads(prevLeads =>
        prevLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead)
      );
      setSelectedLead(null);
      addToast('success', 'Lead updated successfully');
    } catch (error) {
      console.error("Failed to update lead", error);
      addToast('error', 'Failed to update lead');
    }
  }, [addToast]);

  // Bulk Operations
  const handleSelectLead = useCallback((id: string) => {
    setSelectedLeadIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedLeadIds(new Set(filteredLeads.map(l => l.id)));
  }, [filteredLeads]);

  const handleDeselectAll = useCallback(() => {
    setSelectedLeadIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(() => {
    const count = selectedLeadIds.size;
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Multiple Leads',
      message: `Are you sure you want to delete ${count} lead(s)? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const deletePromises = Array.from(selectedLeadIds).map(id => deleteLeadFromDB(id));
          await Promise.all(deletePromises);

          setLeads(prevLeads => prevLeads.filter(lead => !selectedLeadIds.has(lead.id)));
          setSelectedLeadIds(new Set());
          addToast('success', `Deleted ${count} lead(s) successfully`);
        } catch (error) {
          console.error("Failed to bulk delete leads", error);
          addToast('error', 'Failed to delete some leads');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  }, [selectedLeadIds, addToast]);

  const handleBulkStatusChange = useCallback(async (newStatus: string) => {
    const count = selectedLeadIds.size;
    try {
      const updatePromises = Array.from(selectedLeadIds).map(id => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
          return updateLead({ ...lead, status: newStatus as LeadStatus });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      setLeads(prevLeads =>
        prevLeads.map(lead =>
          selectedLeadIds.has(lead.id) ? { ...lead, status: newStatus as LeadStatus } : lead
        )
      );

      setSelectedLeadIds(new Set());
      addToast('success', `Updated ${count} lead(s) to ${newStatus}`);
    } catch (error) {
      console.error("Failed to bulk update status", error);
      addToast('error', 'Failed to update some leads');
    }
  }, [selectedLeadIds, leads, addToast]);

  // Export
  const handleExport = useCallback(() => {
    const leadsToExport = filteredLeads.length > 0 ? filteredLeads : leads;
    exportToCSV(leadsToExport, getExportFilename('leads', 'csv'));
    addToast('success', `Exported ${leadsToExport.length} lead(s) to CSV`);
  }, [filteredLeads, leads, addToast]);

  // Clear Filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    addToast('info', 'Filters cleared');
  }, [addToast]);

  // Show password modal if not authenticated
  if (!isAuthenticated) {
    return <PasswordModal onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen text-[--text-primary] bg-[--background-dark]">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        variant="danger"
      />

      {/* Header */}
      <header className="bg-[--content-dark]/50 backdrop-blur-sm sticky top-0 z-40 border-b border-[--border-dark]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <WandSparklesIcon className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">Lead Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Settings"
              >
                <SettingsIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:px-8 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
              <p className="text-[--text-secondary]">Loading leads...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Dashboard */}
            <KPIDashboard leads={leads} />

            {/* AI Analytics */}
            <AnalyticsDashboard
              leads={leads}
              apiConfig={apiConfig}
              onConfigureApi={() => setIsSettingsModalOpen(true)}
            />

            {/* Lead Input Form */}
            <LeadInputForm onAddLeads={handleAddLeads} />

            {/* Search & Filters */}
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              priorityFilter={priorityFilter}
              onPriorityFilterChange={setPriorityFilter}
              onExport={handleExport}
              onClearFilters={handleClearFilters}
            />

            {/* Bulk Operations Toolbar */}
            <BulkOperationsToolbar
              selectedCount={selectedLeadIds.size}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onBulkDelete={handleBulkDelete}
              onBulkStatusChange={handleBulkStatusChange}
            />

            {/* Leads Grid */}
            {filteredLeads.length === 0 ? (
              leads.length === 0 ? (
                <EmptyState
                  title="No Leads Yet"
                  description="Start by adding your first lead using the form above. You can paste lead data from emails or enter manually."
                  icon={
                    <svg className="w-16 h-16 text-[--text-secondary]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
              ) : (
                <EmptyState
                  title="No Matching Leads"
                  description="No leads match your current filters. Try adjusting your search criteria or clearing filters."
                  action={{
                    label: 'Clear Filters',
                    onClick: handleClearFilters
                  }}
                />
              )
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isSelected={selectedLeadIds.has(lead.id)}
                    onSelect={handleSelectLead}
                    onView={setSelectedLead}
                    onDelete={handleDeleteLead}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {selectedLead && (
        <LeadModal
          lead={selectedLead}
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          onSave={handleUpdateLead}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSaveApiConfig}
          currentConfig={apiConfig}
        />
      )}
    </div>
  );
};

export default App;
