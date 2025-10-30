import React, { useState } from 'react';
import { ApiConfig } from '../types';
import { SettingsIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ApiConfig) => void;
  currentConfig: ApiConfig;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, currentConfig }) => {
  const [config, setConfig] = useState<ApiConfig>(currentConfig);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(config);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-[--content-dark] rounded-2xl shadow-xl border border-[--border-dark]">
        <div className="flex items-center justify-between p-5 border-b border-[--border-dark]">
          <h3 className="text-xl font-semibold text-[--text-primary] flex items-center">
            <SettingsIcon className="w-6 h-6 mr-3"/>
            API Settings
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="provider" className="block text-sm font-medium text-[--text-secondary]">AI Provider</label>
            <select
              id="provider"
              name="provider"
              value={config.provider}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-[--border-dark] bg-[--background-dark] text-[--text-primary] py-2.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
            </select>
            <p className="mt-2 text-xs text-[--text-secondary]">
                Select the AI service you want to use for generating insights.
            </p>
          </div>
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-[--text-secondary]">API Key</label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={config.apiKey}
              onChange={handleInputChange}
              placeholder="Enter your API key"
              className="mt-1 block w-full rounded-md border-[--border-dark] bg-[--background-dark] text-[--text-primary] shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
            />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-[--text-secondary]">Model Name (Optional)</label>
            <input
              type="text"
              id="model"
              name="model"
              value={config.model || ''}
              onChange={handleInputChange}
              placeholder={config.provider === 'gemini' ? "e.g., gemini-2.5-pro" : "e.g., gpt-4-turbo"}
              className="mt-1 block w-full rounded-md border-[--border-dark] bg-[--background-dark] text-[--text-primary] shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
            />
             <p className="mt-2 text-xs text-[--text-secondary]">
                If left blank, a recommended default will be used.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end p-6 space-x-3 border-t border-[--border-dark] bg-[#2a2a2a] rounded-b-xl">
          <button onClick={onClose} type="button" className="text-[--text-primary] bg-gray-700 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-600 rounded-lg border border-[--border-dark] text-sm font-medium px-5 py-2.5 hover:text-white focus:z-10">Cancel</button>
          <button onClick={handleSave} type="button" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;