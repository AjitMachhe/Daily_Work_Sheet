import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Search, Calendar, User, RotateCcw } from 'lucide-react';

export default function ManagerDashboard() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: logsData } = await supabase
      .from('work_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false });

    const { data: usersData } = await supabase
      .from('app_users')
      .select('id, full_name')
      .order('full_name');

    if (logsData) setLogs(logsData);
    if (usersData) setUsers(usersData);
    setLoading(false);
  };

  // Filter logic: Day-wise, User-wise, and Work Done search
  const filteredLogs = logs.filter((log) => {
    const matchesDate = selectedDate ? log.log_date === selectedDate : true;
    const matchesUser = selectedUser ? log.user_id === selectedUser : true;
    const combinedWork = `${log.slot_1_work || ''} ${log.slot_2_work || ''} ${log.slot_3_work || ''}`.toLowerCase();
    const matchesSearch = searchQuery ? combinedWork.includes(searchQuery.toLowerCase()) : true;

    return matchesDate && matchesUser && matchesSearch;
  });

  const resetFilters = () => {
    setSelectedDate('');
    setSelectedUser('');
    setSearchQuery('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Team Work Logs</h1>
          <p className="text-sm text-slate-500">Filter reports by date, team member, or search specific tasks.</p>
        </div>
        <span className="text-xs font-medium bg-slate-200/70 text-slate-700 px-3 py-1.5 rounded-full self-start">
          Showing {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Search Work Done */}
        <div className="relative sm:col-span-2">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search inside work done (e.g. 'landing page', 'bug fix')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Sort / Filter Day-wise */}
        <div className="relative">
          <Calendar size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Sort / Filter User-wise */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <User size={16} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>

          {(selectedDate || selectedUser || searchQuery) && (
            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="p-2 text-slate-600 hover:bg-slate-100 border border-slate-300 rounded-lg"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      {loading ? (
        <p className="text-center text-sm text-slate-500 py-10">Loading logs...</p>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
          <p className="text-slate-600 font-medium">No work logs match your filters.</p>
          <p className="text-xs text-slate-400 mt-1">Try clearing the date or search keyword.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-slate-900">{log.user_name}</span>
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-medium">
                    {log.designation}
                  </span>
                </div>
                <span className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-md">
                  Date: {new Date(log.log_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-sm">
                <div className="grid grid-cols-12 p-3">
                  <span className="col-span-4 sm:col-span-2 font-medium text-slate-500">9.00 – 11.00</span>
                  <span className="col-span-8 sm:col-span-10 text-slate-800">{log.slot_1_work}</span>
                </div>
                <div className="grid grid-cols-12 p-3">
                  <span className="col-span-4 sm:col-span-2 font-medium text-slate-500">11.00 – 1.00</span>
                  <span className="col-span-8 sm:col-span-10 text-slate-800">{log.slot_2_work}</span>
                </div>
                <div className="grid grid-cols-12 p-3">
                  <span className="col-span-4 sm:col-span-2 font-medium text-slate-500">2.00 – 5.00</span>
                  <span className="col-span-8 sm:col-span-10 text-slate-800">{log.slot_3_work}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}