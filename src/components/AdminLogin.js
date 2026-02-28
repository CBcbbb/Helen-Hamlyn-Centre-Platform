import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Simple password check (hardcoded)
    if (password === 'hhcfd2025') {
      onLogin(true);
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-6">
          <Lock size={48} style={{ color: '#00837F' }} />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
          Helen Hamlyn Centre for Design - Admin
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter password to continue
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ outline: 'none', borderColor: password ? '#00837F' : '' }}
              onFocus={(e) => e.target.style.borderColor = '#00837F'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              placeholder="Enter password"
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg transition-colors font-medium"
            style={{ backgroundColor: '#00837F' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#006d69'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#00837F'}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
