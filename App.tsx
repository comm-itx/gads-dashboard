import React, { useState, useEffect, useCallback } from 'react';
import LeadInputForm from './components/LeadInputForm';
import LeadList from './components/LeadList';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import LeadModal from './components/LeadModal';
import SettingsModal from './components/SettingsModal';
import { Lead, LeadData, LeadStatus, ApiConfig } from './types';
import { parseLeadsWithRegex } from './services/aiService';
import { LayoutGridIcon, WandSparklesIcon, SettingsIcon } from './components/icons';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
      provider: 'gemini',
      apiKey: '',
      model: ''
  });

  useEffect(() => {
    try {
      const storedLeads = localStorage.getItem('google-ads-leads');
      if (storedLeads) setLeads(JSON.parse(storedLeads));
      
      const storedApiConfig = localStorage.getItem('ai-api-config');
      if (storedApiConfig) setApiConfig(JSON.parse(storedApiConfig));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('google-ads-leads', JSON.stringify(leads));
    } catch (error) {
      console.error("Failed to save leads to localStorage", error);
    }
  }, [leads]);

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
          setLeads(prevLeads => [...newLeads, ...prevLeads]);
        } else {
          throw new Error("Failed to parse lead data. Please check the format and try again.");
        }
    } catch (error) {
        // Re-throw the error so it can be caught and displayed by the form component
        throw error;
    }
  }, []);
  
  const handleDeleteLead = useCallback((id: string) => {
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== id));
  }, []);

  const handleSelectLead = useCallback((lead: Lead) => {
    setSelectedLead(lead);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLead(null);
  }, []);

  const handleUpdateLead = useCallback((updatedLead: Lead) => {
    setLeads(prevLeads => 
        prevLeads.map(lead => lead.id === updatedLead.id ? updatedLead : lead)
    );
    setSelectedLead(null);
  }, []);

  return (
    <div className="min-h-screen text-[--text-primary] bg-[--background-dark]">
      
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