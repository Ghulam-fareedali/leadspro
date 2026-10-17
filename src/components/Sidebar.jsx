import React from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  LayoutDashboard, 
  Database, 
  PhoneForwarded, 
  Users2, 
  ArrowRightLeft,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, analytics, agents, leads, auth, logout } = useCrm();

  const isAgent = auth?.type === 'agent';
  const agentLeadsCount = leads.filter(l => l.assignedAgent === auth?.name).length;

  const adminNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Database,
      badge: analytics.totalCustomersPool,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    {
      id: 'leads',
      label: 'Leads Pipeline',
      icon: PhoneForwarded,
      badge: analytics.totalLeadsAssigned,
      badgeColor: 'bg-blue-100 text-blue-700 font-bold'
    },
    {
      id: 'team',
      label: 'Team & PINs',
      icon: Users2,
      badge: agents.length,
      badgeColor: 'bg-emerald-100 text-emerald-700 font-bold'
    }
  ];

  const agentNavItems = [
    {
      id: 'leads',
      label: 'My Assigned Leads',
      icon: PhoneForwarded,
      badge: agentLeadsCount,
      badgeColor: 'bg-indigo-100 text-indigo-700 font-bold'
    },
    {
      id: 'dashboard',
      label: 'My Performance',
      icon: LayoutDashboard,
      badge: null
    }
  ];

  const navItems = isAgent ? agentNavItems : adminNavItems;

  const handleSelectTab = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between">
      {/* Top Branding & Navigation */}
      <div>
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">OmniFlow</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                  isAgent ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {isAgent ? 'AGENT' : 'ADMIN'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate max-w-[140px]">
                {auth?.name || 'CRM Portal'}
              </p>
            </div>
          </div>

          {/* Close Button on Mobile Drawer */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
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

      {/* Bottom User Profile & Sign Out */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {auth?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">{auth?.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{auth?.email || (isAgent ? 'Sales Agent' : 'Admin')}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex w-60 h-screen bg-white border-r border-slate-200 flex-col shrink-0 select-none z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (visible when isMobileOpen is true) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={onCloseMobile} 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
