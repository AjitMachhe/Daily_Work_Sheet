import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle2, Send } from 'lucide-react';

export default function EmployeeLogForm({ currentUser }) {
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [slot1, setSlot1] = useState('');
  const [slot2, setSlot2] = useState('');
  const [slot3, setSlot3] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);

    const { error } = await supabase.from('work_logs').insert([
      {
        log_date: logDate,
        user_id: currentUser.id,
        user_name: currentUser.full_name,
        designation: currentUser.designation,
        slot_1_work: slot1,
        slot_2_work: slot2,
        slot_3_work: slot3,
      },
    ]);

    setSubmitting(false);
    if (!error) {
      setSaved(true);
      setSlot1('');
      setSlot2('');
      setSlot3('');
      setTimeout(() => setSaved(false), 4000);
    } else {
      alert('Error saving log: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Daily Work Sheet</h1>
        <p className="text-sm text-slate-500">Record your tasks across your scheduled shift slots.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Top Metadata Header matching your screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 bg-slate-50/70 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="p-4 flex items-center justify-between md:justify-start gap-3">
            <span className="text-sm font-semibold text-slate-700">Date:</span>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              required
              className="text-sm font-medium text-blue-600 bg-white border border-slate-300 rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="p-4 flex items-center justify-between md:justify-start gap-2">
            <span className="text-sm font-semibold text-slate-700">Name:</span>
            <span className="text-sm font-medium text-blue-600">{currentUser.full_name}</span>
          </div>

          <div className="p-4 flex items-center justify-between md:justify-start gap-2">
            <span className="text-sm font-semibold text-slate-700">Designation:</span>
            <span className="text-sm font-medium text-blue-600">{currentUser.designation}</span>
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-100/60 text-xs font-bold uppercase tracking-wider text-slate-700">
          <div className="col-span-2 sm:col-span-1 p-3.5 text-center border-r border-slate-200">Sr. No.</div>
          <div className="col-span-4 sm:col-span-3 p-3.5 text-center border-r border-slate-200">Time</div>
          <div className="col-span-6 sm:col-span-8 p-3.5">Details of Work Done</div>
        </div>

        {/* Row 1: 9.00 to 11.00 */}
        <div className="grid grid-cols-12 border-b border-slate-200">
          <div className="col-span-2 sm:col-span-1 p-4 flex items-center justify-center text-sm font-medium text-slate-600 border-r border-slate-200">
            1
          </div>
          <div className="col-span-4 sm:col-span-3 p-4 flex items-center justify-center text-sm font-medium text-slate-800 border-r border-slate-200 bg-slate-50/40">
            9.00 to 11.00
          </div>
          <div className="col-span-6 sm:col-span-8 p-2">
            <textarea
              rows={2}
              required
              placeholder="Describe tasks completed between 9:00 AM and 11:00 AM..."
              value={slot1}
              onChange={(e) => setSlot1(e.target.value)}
              className="w-full p-2 text-sm text-slate-800 rounded-lg focus:outline-none focus:bg-slate-50 resize-none"
            />
          </div>
        </div>

        {/* Row 2: 11.00 to 1.00 */}
        <div className="grid grid-cols-12 border-b border-slate-200">
          <div className="col-span-2 sm:col-span-1 p-4 flex items-center justify-center text-sm font-medium text-slate-600 border-r border-slate-200">
            2
          </div>
          <div className="col-span-4 sm:col-span-3 p-4 flex items-center justify-center text-sm font-medium text-slate-800 border-r border-slate-200 bg-slate-50/40">
            11.00 to 1.00
          </div>
          <div className="col-span-6 sm:col-span-8 p-2">
            <textarea
              rows={2}
              required
              placeholder="Describe tasks completed between 11:00 AM and 1:00 PM..."
              value={slot2}
              onChange={(e) => setSlot2(e.target.value)}
              className="w-full p-2 text-sm text-slate-800 rounded-lg focus:outline-none focus:bg-slate-50 resize-none"
            />
          </div>
        </div>

        {/* Row 3: 2.00 to 5.00 */}
        <div className="grid grid-cols-12 border-b border-slate-200">
          <div className="col-span-2 sm:col-span-1 p-4 flex items-center justify-center text-sm font-medium text-slate-600 border-r border-slate-200">
            3
          </div>
          <div className="col-span-4 sm:col-span-3 p-4 flex items-center justify-center text-sm font-medium text-slate-800 border-r border-slate-200 bg-slate-50/40">
            2.00 to 5.00
          </div>
          <div className="col-span-6 sm:col-span-8 p-2">
            <textarea
              rows={2}
              required
              placeholder="Describe tasks completed between 2:00 PM and 5:00 PM..."
              value={slot3}
              onChange={(e) => setSlot3(e.target.value)}
              className="w-full p-2 text-sm text-slate-800 rounded-lg focus:outline-none focus:bg-slate-50 resize-none"
            />
          </div>
        </div>

        {/* Submit Footer */}
        <div className="p-4 bg-slate-50 flex items-center justify-between">
          {saved ? (
            <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
              <CheckCircle2 size={16} /> Daily work log submitted successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">All 3 time slots are required before submitting.</span>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            <Send size={15} />
            {submitting ? 'Submitting...' : 'Submit Work Log'}
          </button>
        </div>
      </form>
    </div>
  );
}