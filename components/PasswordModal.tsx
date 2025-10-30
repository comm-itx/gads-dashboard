import React, { useState } from 'react';

interface PasswordModalProps {
  onAuthenticated: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const CORRECT_PIN = '5542';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === CORRECT_PIN) {
      sessionStorage.setItem('dashboard-auth', 'true');
      onAuthenticated();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[--content-dark] rounded-lg p-8 max-w-md w-full mx-4 border border-[--border-dark]">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Protected Dashboard</h2>
          <p className="text-[--text-secondary]">Enter PIN to access</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter 4-digit PIN"
              className="w-full px-4 py-3 bg-[--background-dark] border border-[--border-dark] rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-blue-400 transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Unlock Dashboard
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[--border-dark]">
          <p className="text-xs text-[--text-secondary] text-center">
            Session expires when browser is closed
          </p>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;
