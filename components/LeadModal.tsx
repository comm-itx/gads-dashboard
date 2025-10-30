import React, { useState, useEffect } from 'react';
import { Lead, LEAD_STATUSES } from '../types';
import { EditIcon } from './icons';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  lead: Lead;
}

const LeadModal: React.FC<LeadModalProps> = ({ isOpen, onClose, onSave, lead }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Lead>(lead);

  useEffect(() => {
    setFormData(lead);
    setIsEditing(false); // Reset to view mode when lead changes
  }, [lead]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(lead);
    setIsEditing(false);
  };

  const renderField = (label: string, name: keyof Lead, type: 'text' | 'textarea' | 'select' = 'text') => {
    const value = formData[name];
    if (isEditing) {
      if (type === 'textarea') {
        return (
          <div>
            <label className="block text-sm font-medium text-[--text-secondary]">{label}</label>
            <textarea
              name={name}
              value={value as string}
              onChange={handleInputChange}
              rows={5}
              className="mt-1 block w-full rounded-md border-[--border-dark] bg-[--background-dark] text-[--text-primary] shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
            />
          </div>
        );
      }
      if (type === 'select' && name === 'status') {
          return (
            <div>
                <label htmlFor="status" className="block text-sm font-medium text-[--text-secondary]">{label}</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-[--border-dark] bg-[--background-dark] text-[--text-primary] py-2.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                >
                    {LEAD_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
          );
      }
      return (
        <div>
          <label className="block text-sm font-medium text-[--text-secondary]">{label}</label>
          <input
            type="text"
            name={name}
            value={value as string}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-[--border-dark] bg-[--background-dark] text-[--text-primary] shadow-sm focus:border-blue-500 focus:ring-blue-500 p-3"
          />
        </div>
      );
    }
    // View Mode
    return (
      <div>
        <h4 className="text-sm font-medium text-[--text-secondary]">{label}</h4>
        <p className="mt-1 text-[--text-primary] break-words whitespace-pre-wrap">{value as string}</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
            className="fixed inset-0 bg-black/70"
            onClick={onClose}
        ></div>

        {/* Modal Panel */}
        <div className="relative w-full max-w-2xl bg-[--content-dark] rounded-2xl shadow-xl overflow-hidden border border-[--border-dark]">
            <div className="flex items-start justify-between p-5 border-b border-[--border-dark]">
                <h3 className="text-xl font-semibold text-[--text-primary]">
                    {isEditing ? 'Edit Lead Details' : 'Lead Details'}
                </h3>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="p-2 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white"
                    >
                        <EditIcon className="w-5 h-5" />
                        <span className="sr-only">Edit Lead</span>
                    </button>
                )}
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {renderField('Status', 'status', 'select')}
                {renderField('Notes', 'notes', 'textarea')}
                <hr className="border-[--border-dark]"/>
                {renderField('Name', 'name')}
                {renderField('Email', 'email')}
                {renderField('Phone', 'phone')}
                {renderField('Message', 'message', 'textarea')}
                {renderField('Date', 'date')}
                {renderField('Time', 'time')}
                {renderField('Page URL', 'pageUrl')}
            </div>

            <div className="flex items-center p-6 space-x-3 border-t border-[--border-dark] bg-[#2a2a2a] rounded-b-xl">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} type="button" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Save Changes</button>
                        <button onClick={handleCancel} type="button" className="text-[--text-primary] bg-gray-700 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-600 rounded-lg border border-[--border-dark] text-sm font-medium px-5 py-2.5 hover:text-white focus:z-10">Cancel</button>
                    </>
                ) : (
                    <button onClick={onClose} type="button" className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Close</button>
                )}
            </div>
        </div>
    </div>
  );
};

export default LeadModal;