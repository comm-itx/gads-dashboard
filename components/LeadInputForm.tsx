import React, { useState, useRef } from 'react';
import { UploadCloudIcon, PlusCircleIcon } from './icons';

interface LeadInputFormProps {
  onAddLeads: (text: string) => Promise<void>;
}

const LeadInputForm: React.FC<LeadInputFormProps> = ({ onAddLeads }) => {
  const [leadText, setLeadText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exampleLead = `Name: Kanwaljeet Singh
Email: kanwaljeet@arorairon.com
Phone: 8146183666
Message: is this also available on premise. if yes please share quote. thanks

---

Date: October 28, 2025
Time: 9:04 am
Page URL: https://commitindia.in/document-management-systems/?gad_source=1`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadText.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await onAddLeads(leadText);
      setLeadText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
        return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
        // Fix: Replaced file.text() with a FileReader-based approach for wider compatibility.
        const readAsText = (file: File): Promise<string> => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });
        };

        const allTexts = await Promise.all(
            Array.from(files).map(readAsText)
        );
        
        const combinedText = allTexts.join('\n---\n'); // Join content with separator

        if (combinedText.trim()) {
            await onAddLeads(combinedText);
        } else {
            setError('The selected .txt files are empty or contain no valid text.');
        }

    } catch (err) {
        console.error('Error processing .txt files:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred while processing the files.');
    } finally {
        setIsLoading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  return (
    <div className="bg-[--content-dark] p-6 rounded-xl border border-[--border-dark]">
      <div className="flex items-center mb-4">
        <PlusCircleIcon className="w-6 h-6 mr-3 text-blue-400" />
        <div>
            <h2 className="text-xl font-bold text-[--text-primary]">Add New Lead(s)</h2>
            <p className="text-sm text-[--text-secondary]">
                Paste leads below or upload one or more .txt files.
            </p>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={leadText}
          onChange={(e) => setLeadText(e.target.value)}
          placeholder={exampleLead}
          className="w-full h-48 p-4 border border-[--border-dark] rounded-lg bg-[--background-dark] text-[--text-primary] focus:ring-2 focus:ring-[--accent-blue] focus:outline-none transition placeholder:text-gray-600"
          disabled={isLoading}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-4 justify-between items-center">
          <div>
            <input type="file" accept=".txt" onChange={handleFileChange} ref={fileInputRef} className="hidden" multiple />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-4 py-2.5 bg-gray-700 text-[--text-primary] text-sm font-semibold rounded-lg border border-[--border-dark] hover:bg-gray-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center"
            >
                <UploadCloudIcon className="w-5 h-5 mr-2" />
                Upload .txt File(s)
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading || !leadText.trim()}
            className="px-6 py-2.5 bg-[--accent-blue] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Parse & Add'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeadInputForm;