import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Upload, UserPlus, Award, Trash2 } from 'lucide-react';

export default function AdminPanel({ orgSettings, refreshOrgSettings }) {
  const [designations, setDesignations] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Form states
  const [newDesignation, setNewDesignation] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('employee');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [companyName, setCompanyName] = useState(orgSettings?.company_name || '');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const { data: desData } = await supabase.from('designations').select('*').order('title');
    const { data: usrData } = await supabase.from('app_users').select('*').order('full_name');
    if (desData) {
      setDesignations(desData);
      if (desData.length > 0 && !selectedDesignation) setSelectedDesignation(desData[0].title);
    }
    if (usrData) setUsers(usrData);
  };

  // Upload Logo to Supabase Storage & Update Org Settings
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `logo-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('company-assets')
      .upload(fileName, file);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('company-assets')
      .getPublicUrl(fileName);

    await supabase
      .from('org_settings')
      .update({ logo_url: publicUrlData.publicUrl, company_name: companyName })
      .eq('id', 1);

    await refreshOrgSettings();
    setUploading(false);
  };

  const handleSaveBrandName = async (e) => {
    e.preventDefault();
    await supabase.from('org_settings').update({ company_name: companyName }).eq('id', 1);
    await refreshOrgSettings();
    alert('Company branding updated!');
  };

  const handleAddDesignation = async (e) => {
    e.preventDefault();
    if (!newDesignation.trim()) return;
    const { error } = await supabase.from('designations').insert([{ title: newDesignation.trim() }]);
    if (!error) {
      setNewDesignation('');
      loadAdminData();
    } else {
      alert(error.message);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('app_users').insert([
      {
        full_name: fullName,
        email: email.toLowerCase(),
        role,
        designation: selectedDesignation,
      },
    ]);

    if (!error) {
      setFullName('');
      setEmail('');
      loadAdminData();
    } else {
      alert(error.message);
    }
  };

  const handleDeleteUser = async (id) => {
    await supabase.from('app_users').delete().eq('id', id);
    loadAdminData();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Admin Control Panel</h1>
        <p className="text-sm text-slate-500">Manage SaaS white-label branding, job designations, and team access.</p>
      </div>

      {/* 1. White-Label Branding & Logo Upload */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Upload size={18} className="text-indigo-600" /> Company Branding & Custom Logo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <form onSubmit={handleSaveBrandName} className="space-y-3">
            <label className="block text-xs font-medium text-slate-600 uppercase">Workspace / Company Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800">
                Save Name
              </button>
            </div>
          </form>

          <div>
            <label className="block text-xs font-medium text-slate-600 uppercase mb-2">Upload Company Logo (PNG/SVG)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={uploading}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading logo to cloud...</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 2. Manage Designations */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Award size={18} className="text-indigo-600" /> Designations
          </h2>
          <form onSubmit={handleAddDesignation} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="e.g. UI/UX Designer"
              value={newDesignation}
              onChange={(e) => setNewDesignation(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
            <button type="submit" className="px-3 py-2 bg-slate-900 text-white text-sm rounded-lg">
              Add
            </button>
          </form>
          <ul className="divide-y divide-slate-100 text-sm">
            {designations.map((d) => (
              <li key={d.id} className="py-2 text-slate-700 font-medium">{d.title}</li>
            ))}
          </ul>
        </div>

        {/* 3. Add Users */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-indigo-600" /> Add Team Member
          </h2>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <input
              type="text"
              required
              placeholder="Full Name (e.g. Ajit C. Machhe)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
            <select
              value={selectedDesignation}
              onChange={(e) => setSelectedDesignation(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            >
              {designations.map((d) => (
                <option key={d.id} value={d.title}>{d.title}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                <option value="employee">Employee (Fills Logs)</option>
                <option value="manager">Manager (Views & Filters)</option>
                <option value="admin">Admin (Full Access)</option>
              </select>
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg">
                Create User
              </button>
            </div>
          </form>

          {/* Users Directory */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-y border-slate-200">
                <tr>
                  <th className="py-2 px-3">Name</th>
                  <th className="py-2 px-3">Designation</th>
                  <th className="py-2 px-3">Role</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {u.full_name}
                      <span className="block text-xs text-slate-400 font-normal">{u.email}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{u.designation}</td>
                    <td className="py-2.5 px-3 capitalize">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-700 font-medium">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button onClick={() => handleDeleteUser(u.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}