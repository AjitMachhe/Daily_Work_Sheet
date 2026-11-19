import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import Navbar from './components/Navbar';
import AdminPanel from './components/AdminPanel';
import EmployeeLogForm from './components/EmployeeLogForm';
import ManagerDashboard from './components/ManagerDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [orgSettings, setOrgSettings] = useState(null);
  const [activeTab, setActiveTab] = useState('log');
  const [loginEmail, setLoginEmail] = useState('');

  useEffect(() => {
    fetchOrgSettings();
  }, []);

  const fetchOrgSettings = async () => {
    const { data } = await supabase.from('org_settings').select('*').eq('id', 1).single();
    if (data) setOrgSettings(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { data } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', loginEmail.toLowerCase().trim())
      .single();

    if (data) {
      setCurrentUser(data);
      setLoginEmail('');
      if (data.role === 'admin') setActiveTab('admin');
      else if (data.role === 'manager') setActiveTab('manager');
      else setActiveTab('log');
    } else {
      alert('User not found. Please enter your registered work email.');
    }
  };

  // Minimalist Private Login Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-col items-center mb-6">
            {orgSettings?.logo_url && (
              <img src={orgSettings.logo_url} alt="Logo" className="h-12 mb-3 object-contain" />
            )}
            <h1 className="text-xl font-bold text-slate-900">{orgSettings?.company_name || 'WorkLog Pro'}</h1>
            <p className="text-sm text-slate-500">Sign in to access your workspace</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Work Email</label>
              <input
                type="email"
                required
                placeholder="name@dypgroup.edu.in"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm py-2.5 rounded-lg transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        currentUser={currentUser}
        orgSettings={orgSettings}
        onLogout={() => setCurrentUser(null)}
      />

      {/* Role-Based Sub-Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('log')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'log' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fill Daily Log
          </button>

          {(currentUser.role === 'manager' || currentUser.role === 'admin') && (
            <button
              onClick={() => setActiveTab('manager')}
              className={`py-3 border-b-2 transition ${
                activeTab === 'manager' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Manager Reports
            </button>
          )}

          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-3 border-b-2 transition ${
                activeTab === 'admin' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Admin Settings
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 py-8 px-4">
        {activeTab === 'log' && <EmployeeLogForm currentUser={currentUser} />}
        {activeTab === 'manager' && <ManagerDashboard />}
        {activeTab === 'admin' && (
          <AdminPanel orgSettings={orgSettings} refreshOrgSettings={fetchOrgSettings} />
        )}
      </main>
    </div>
  );
}