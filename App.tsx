import React, { useState, useEffect, useCallback } from 'react';
import LeadInputForm from './components/LeadInputForm';
import LeadList from './components/LeadList';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LeadModal from './components/LeadModal';
import SettingsModal from './components/SettingsModal';
import PasswordModal from './components/PasswordModal';
import { Lead, LeadData, LeadStatus, ApiConfig } from './types';
import { parseLeadsWithRegex } from './services/aiService';
import { fetchLeads, createLeads, updateLead, deleteLead as deleteLeadFromDB } from './services/databaseService';
import { LayoutGridIcon, WandSparklesIcon, SettingsIcon } from './components/icons';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
      provider: 'gemini',
      apiKey: '',
      model: ''
  });

  // Check authentication on mount
  useEffect(() => {
    const auth = sessionStorage.getItem('dashboard-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthenticated = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  // Load leads from database on mount (only when authenticated)
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
        setError(err.message || "Failed to load leads. Please check your API connection.");
      } finally {
        setIsLoading(false);
      }
    };

    // Load API config from localStorage (still kept local)
    try {
      const storedApiConfig = localStorage.getItem('ai-api-config');
      if (storedApiConfig) setApiConfig(JSON.parse(storedApiConfig));
    } catch (error) {
      console.error("Failed to load API config from localStorage", error);
    }

    loadLeads();
  }, [isAuthenticated]);

  const handleSaveApiConfig = useCallback((config: ApiConfig) => {
      setApiConfig(config);
      try {
          localStorage.setItem('ai-api-config', JSON.stringify(config));
      } catch (error) {
          console.error("Failed to save API config to localStorage", error);
      }
      setIsSettingsModalOpen(false);
  }, []);

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

          // Save to database
          const createdLeads = await createLeads(newLeads);

          // Update local state with created leads
          setLeads(prevLeads => [...createdLeads, ...prevLeads]);
        } else {
          throw new Error("Failed to parse lead data. Please check the format and try again.");
        }
    } catch (error) {
        // Re-throw the error so it can be caught and displayed by the form component
        throw error;
    }
  }, []);
  
  const handleDeleteLead = useCallback(async (id: string) => {
    try {
      // Delete from database
      await deleteLeadFromDB(id);
      // Update local state
      setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
    } catch (error) {
      console.error("Failed to delete lead", error);
      throw error;
    }
  }, []);

  const handleSelectLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLead(null);
  }, []);

  const handleUpdateLead = useCallback(async (updatedLead: Lead) => {
    try {
      // Update in database
      await updateLead(updatedLead);
      // Update local state
      setLeads(prevLeads =>
          prevLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead)
      );
      setSelectedLead(null);
    } catch (error) {
      console.error("Failed to update lead", error);
      throw error;
    }
  }, []);

  // Show password modal if not authenticated
  if (!isAuthenticated) {
    return <PasswordModal onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen text-[--text-primary] bg-[--background-dark]">

      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/50 border-b border-red-700 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-red-100 text-sm">⚠️ {error}</p>
            <button onClick={() => setError(null)} className="text-red-100 hover:text-white">✕</button>
          </div>
        </div>
      )}

      <header className="bg-[--content-dark]/50 backdrop-blur-sm sticky top-0 z-10 border-b border-[--border-dark]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-3">
                      <WandSparklesIcon className="w-8 h-8 text-blue-400" />
                      <span className="text-2xl font-bold text-white">Google Ads Lead Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-4">
                      <button onClick={() => setIsSettingsModalOpen(true)} className="text-gray-400 hover:text-white transition-colors" aria-label="API Settings">
                          <SettingsIcon className="w-6 h-6" />
                      </button>
                      <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-sm text-[--text-secondary] hover:text-white transition-colors">
                          Powered by AI
                      </a>
                  </div>
              </div>
          </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          {isLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-[--text-secondary]">Loading leads from database...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <LayoutGridIcon className="w-6 h-6 mr-3 text-blue-400"/>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Analytics & Insights
                  </h1>
                  <p className="text-md text-[--text-secondary]">
                    Your central hub for analyzing ad leads.
                  </p>
                </div>
              </div>
              <AnalyticsDashboard
                  leads={leads}
                  apiConfig={apiConfig}
                  onConfigureApi={() => setIsSettingsModalOpen(true)}
              />

              <div className="space-y-8">
                  <LeadInputForm onAddLeads={handleAddLeads} />
                  <LeadList leads={leads} onDeleteLead={handleDeleteLead} onSelectLead={handleSelectLead} />
              </div>
            </>
          )}
      </main>

        {selectedLead && (
            <LeadModal 
                lead={selectedLead} 
                isOpen={!!selectedLead} 
                onClose={handleCloseModal} 
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