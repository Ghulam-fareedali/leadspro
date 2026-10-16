import React from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  LayoutDashboard, 
  Database, 
  Filter, 
  Users2, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  PhoneForwarded,
  ArrowRightLeft
} from 'lucide-react';

export const Sidebar = () => {
  const { activeTab, setActiveTab, analytics, agents } = useCrm();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'Analytics & Pipeline Funnel'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Database,
      badge: analytics.totalCustomersPool,
      badgeColor: 'bg-slate-200 text-slate-700',
      description: 'Raw Data Pool & Bulk Import'
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: PhoneForwarded,
      badge: analytics.totalLeadsAssigned,
      badgeColor: 'bg-blue-100 text-blue-700 font-bold',
      description: 'Action Pipeline & Statuses'
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users2,
      badge: `${agents.length} Member${agents.length !== 1 ? 's' : ''}`,
      badgeColor: 'bg-emerald-100 text-emerald-700 font-bold',
      description: 'Agent Roster & Performance'
    }
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none z-20">
      {/* Top Branding */}
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">OmniFlow</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 uppercase">
                CRM
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Customer & Lead Pipeline</p>
          </div>
        </div>

        {/* Workflow Architecture Card */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Separation Flow</span>
              <span className="text-blue-600 font-bold">2-Tier</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Data Pool
              </span>
              <span className="text-slate-400">→</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Action Pipeline
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-3 space-y-1">
          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            System Modules
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Pipeline Progress Card */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>Pool Distributed</span>
            <span className="text-blue-600 font-extrabold">
              {analytics.totalCustomersPool > 0
                ? Math.round((analytics.totalLeadsAssigned / analytics.totalCustomersPool) * 100)
                : 0}%
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  analytics.totalCustomersPool > 0
                    ? Math.round((analytics.totalLeadsAssigned / analytics.totalCustomersPool) * 100)
                    : 0
                }%`
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-[11px] text-slate-500 font-medium">
            <span>{analytics.totalLeadsAssigned} Assigned</span>
            <span>{analytics.unassignedCount} In Pool</span>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>Enterprise v3.2</span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Live Sync
          </span>
        </div>
      </div>
    </aside>
  );
};
