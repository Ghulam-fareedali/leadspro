import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Search, 
  Upload, 
  Calendar, 
  Bell, 
  Sparkles, 
  Check, 
  Layers, 
  Activity, 
  HelpCircle,
  Database,
  LogOut,
  KeyRound,
  ShieldCheck,
  Pencil,
  X
} from 'lucide-react';

export const Header = ({ onOpenUpload, searchQuery, setSearchQuery }) => {
  const { analytics, customers, leads, activeTab, dbStatus, auth, logout, adminProfile, updateAdminProfile } = useCrm();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Admin Profile Edit Modal State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');

  const handleSaveAdminProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateAdminProfile({
      name: editName.trim(),
      email: editEmail.trim(),
      password: editPassword.trim()
    });
    setShowAdminModal(false);
  };

  // Close notifications popover on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search across ${customers.length} customers & ${leads.length} leads...`}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Right Action & Info Area */}
      <div className="flex items-center gap-3.5">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200/90 rounded-lg text-xs font-semibold text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{dateStr}</span>
        </div>

        {/* Database Status Badge */}
        <div 
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            dbStatus?.connected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : dbStatus?.mode === 'server-local'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
          title={dbStatus?.message || 'Database status'}
        >
          <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : dbStatus?.mode === 'server-local' ? 'bg-blue-500' : 'bg-slate-400'}`} />
          <span className="text-[11px] font-bold">
            {dbStatus?.connected ? 'MongoDB Live' : dbStatus?.mode === 'server-local' ? 'API Active' : 'Offline / Local'}
          </span>
        </div>

        {/* Bulk Upload Button (Admin Only) */}
        {auth?.type === 'admin' && (
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-xs hover:border-blue-300 cursor-pointer"
            title="Upload Excel or CSV data into Customers pool"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Upload Excel/CSV</span>
          </button>
        )}

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
            title="Recent Pipeline Activity"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pipeline Activity Log</span>
                </div>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  Real-time
                </span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 my-1 text-xs">
                <div className="py-2 px-1 hover:bg-slate-50 rounded">
                  <p className="font-semibold text-slate-800">
                    {analytics.totalLeadsAssigned} leads in active workflow
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {analytics.interestedCount} marked as <strong>Interested</strong> (Hot Leads)
                  </p>
                </div>
                <div className="py-2 px-1 hover:bg-slate-50 rounded">
                  <p className="font-semibold text-slate-800">
                    {analytics.unassignedCount} records in raw pool
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Ready for batch assignment to sales team.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-slate-200" />

        {/* User Profile Chip (Admin or Agent) */}
        <div className="flex items-center gap-2">
          <div 
            onClick={() => {
              if (auth?.type === 'admin') {
                setEditName(auth.name || '');
                setEditEmail(auth.email || '');
                setEditPassword(adminProfile?.password || '');
                setShowAdminModal(true);
              }
            }}
            className={`flex items-center gap-2.5 p-1 rounded-xl transition-all ${
              auth?.type === 'admin' 
                ? 'hover:bg-slate-100 cursor-pointer' 
                : ''
            }`}
            title={auth?.type === 'admin' ? "Click to Edit Admin Profile & Name" : undefined}
          >
            {auth?.avatar ? (
              <img
                src={auth.avatar}
                alt={auth.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {auth?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </div>
            )}

            <div className="hidden lg:block text-left text-xs">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-slate-800 leading-tight">{auth?.name || 'User'}</p>
                {auth?.type === 'admin' ? (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-extrabold uppercase flex items-center gap-0.5">
                    <span>Admin</span>
                    <Pencil className="w-2 h-2 opacity-60" />
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-extrabold flex items-center gap-0.5" title={`Security PIN: ${auth?.pin}`}>
                    <KeyRound className="w-2.5 h-2.5" />
                    <span>PIN: {auth?.pin}</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">{auth?.role || 'Team Member'}</p>
            </div>
          </div>

          {/* Logout / Switch Portal Button */}
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Sign Out / Switch Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Profile Settings Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Admin Profile Settings</h3>
                  <p className="text-[11px] text-slate-400">Update your Administrator display name and credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminProfile} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Administrator Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Ghulam Fareed"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
                <p className="text-[10px] text-slate-400">This name will appear on the header and throughout the CRM.</p>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Admin Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="admin@yourcompany.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Admin Login Password</label>
                <input
                  type="password"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
