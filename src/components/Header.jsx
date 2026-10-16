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
  Database
} from 'lucide-react';

export const Header = ({ onOpenUpload, searchQuery, setSearchQuery }) => {
  const { analytics, customers, leads, activeTab, dbStatus } = useCrm();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

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

        {/* Bulk Upload Button (Prominent) */}
        <button
          onClick={onOpenUpload}
          className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-xs hover:border-blue-300"
          title="Upload Excel or CSV data into Customers pool"
        >
          <Upload className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Upload Excel/CSV</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none"
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

        {/* Admin User Chip */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            AK
          </div>
          <div className="hidden lg:block text-left text-xs">
            <p className="font-bold text-slate-800 leading-tight">Ali Khan</p>
            <p className="text-[10px] text-slate-400 leading-tight">Admin & Lead Ops</p>
          </div>
        </div>
      </div>
    </header>
  );
};
