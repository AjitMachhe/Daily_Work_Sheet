import React from 'react';
import { LogOut, Briefcase } from 'lucide-react';

export default function Navbar({ currentUser, orgSettings, onLogout }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {orgSettings?.logo_url ? (
            <img 
              src={orgSettings.logo_url} 
              alt="Company Logo" 
              className="h-9 w-auto object-contain rounded"
            />
          ) : (
            <div className="h-9 w-9 bg-slate-900 text-white rounded-lg flex items-center justify-center">
              <Briefcase size={18} />
            </div>
          )}
          <span className="font-semibold text-lg tracking-tight text-slate-800">
            {orgSettings?.company_name || 'WorkLog Pro'}
          </span>
        </div>

        {currentUser && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-800">{currentUser.full_name}</p>
              <p className="text-xs text-slate-500 capitalize">
                {currentUser.designation} • <span className="text-indigo-600 font-medium">{currentUser.role}</span>
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
              title="Switch User / Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}