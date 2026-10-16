import React, { useState, useMemo } from 'react';
import { useLead } from '../context/LeadContext';
import { KpiCard } from './KpiCard';
import { StatusBadge, PriorityBadge } from './Badge';
import { 
  PhoneCall, 
  Target, 
  Clock, 
  CheckCircle2, 
  PhoneForwarded, 
  Search, 
  Sparkles, 
  Check, 
  Phone, 
  Mail, 
  ExternalLink,
  ChevronDown,
  Smile,
  PartyPopper,
  Flame,
  FileEdit,
  ArrowRight
} from 'lucide-react';

export const AgentDashboard = ({ onStartCall, onOpenLeadDetails, searchQuery, onSearchChange }) => {
  const { 
    currentUser, 
    agentKPIs, 
    leads, 
    updateLeadStatus, 
    statusConfig 
  } = useLead();

  // Quick Filter Tabs: 'All', 'Pending (Calls Left)', 'Follow-up', 'Completed'
  const [activeFilterTab, setActiveFilterTab] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  // Active search query
  const query = searchQuery !== undefined ? searchQuery : localSearch;

  // Filter ONLY leads assigned to the currently selected agent
  const myLeads = useMemo(() => {
    return leads.filter(l => l.assignedTo === currentUser.name);
  }, [leads, currentUser]);

  // Apply Quick Filter tabs
  const filteredMyLeads = useMemo(() => {
    return myLeads.filter(lead => {
      // Search matching
      const matchesSearch = query === '' ||
        lead.name.toLowerCase().includes(query.toLowerCase()) ||
        lead.phone.includes(query) ||
        lead.email.toLowerCase().includes(query.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filtering
      if (activeFilterTab === 'All') return true;
      if (activeFilterTab === 'Pending (Calls Left)') return lead.status === 'Pending';
      if (activeFilterTab === 'Follow-up') return lead.status === 'Follow-up';
      if (activeFilterTab === 'Completed') return lead.status === 'Call Done' || lead.status === 'Converted';
      if (activeFilterTab === 'Dead') return lead.status === 'Dead';

      return true;
    });
  }, [myLeads, activeFilterTab, query]);

  // Count helper for tabs
  const tabCounts = useMemo(() => {
    return {
      All: myLeads.length,
      'Pending (Calls Left)': myLeads.filter(l => l.status === 'Pending').length,
      'Follow-up': myLeads.filter(l => l.status === 'Follow-up').length,
      Completed: myLeads.filter(l => l.status === 'Call Done' || l.status === 'Converted').length,
      Dead: myLeads.filter(l => l.status === 'Dead').length
    };
  }, [myLeads]);

  const tabs = [
    { id: 'All', label: 'All Leads', count: tabCounts.All },
    { id: 'Pending (Calls Left)', label: 'Pending (Calls Left)', count: tabCounts['Pending (Calls Left)'], highlight: tabCounts['Pending (Calls Left)'] > 0 },
    { id: 'Follow-up', label: 'Follow-up', count: tabCounts['Follow-up'] },
    { id: 'Completed', label: 'Completed', count: tabCounts.Completed }
  ];

  return (
    <div className="space-y-6">
      {/* Personalized Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-2xl object-cover ring-4 ring-blue-50 border-2 border-white shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                Welcome back, {currentUser.name}! 👋
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Agent Workplace
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              You have <strong className="text-amber-600 font-bold">{agentKPIs.callsLeft} pending calls</strong> remaining today.
              Complete your queue to reach 100% target!
            </p>
          </div>
        </div>

        {/* Motivational pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 p-3 rounded-xl">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Today's Outreach Pace
            </span>
            <span className="text-sm font-bold text-slate-800">
              {agentKPIs.callsMade} / {agentKPIs.myTarget} Handled ({agentKPIs.completionPct}%)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* 1. PERSONAL KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: My Target / Total Leads */}
        <KpiCard
          title="My Target / Total Leads"
          value={agentKPIs.myTarget}
          subtitle={`Total leads assigned to ${currentUser.name}`}
          icon={Target}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
          trend="Assigned queue"
          trendPositive={true}
          badgeText="Workload"
        />

        {/* KPI 2: Calls Made */}
        <KpiCard
          title="Calls Made"
          value={agentKPIs.callsMade}
          subtitle="Leads updated (status != Pending)"
          icon={PhoneCall}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          trend={`${agentKPIs.completionPct}% complete`}
          trendPositive={agentKPIs.callsMade > 0}
          progressBar={agentKPIs.completionPct}
          badgeText="Completed"
        />

        {/* KPI 3: Calls Left */}
        <KpiCard
          title="Calls Left"
          value={agentKPIs.callsLeft}
          subtitle="Remaining 'Pending' calls"
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
          trend={agentKPIs.callsLeft === 0 ? "Queue Cleared!" : `${agentKPIs.callsLeft} left to call`}
          trendPositive={agentKPIs.callsLeft === 0}
          badgeText={agentKPIs.callsLeft === 0 ? "Goal Met" : "In Progress"}
        />
      </div>

      {/* 2. ACTIONABLE LEADS SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Header with Search and Quick Filter Tabs */}
        <div className="p-5 border-b border-slate-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  My Actionable Leads
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {filteredMyLeads.length} showing
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Directly dial numbers or update call statuses right from the table row.
              </p>
            </div>

            {/* In-table Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  if (onSearchChange) onSearchChange(e.target.value);
                  setLocalSearch(e.target.value);
                }}
                placeholder="Search by name, phone or email..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Quick Filter Tabs (Pill-shaped tabs) */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            {tabs.map((tab) => {
              const isActive = activeFilterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilterTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.highlight
                        ? 'bg-amber-100 text-amber-800 font-extrabold'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actionable Leads Table OR Empty State */}
        {filteredMyLeads.length === 0 ? (
          /* Empty State Display */
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-xs">
              {activeFilterTab === 'Pending (Calls Left)' ? (
                <PartyPopper className="w-8 h-8 text-emerald-500 animate-bounce" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              )}
            </div>

            <div className="max-w-md space-y-1">
              <h3 className="text-base font-bold text-slate-800">
                {activeFilterTab === 'Pending (Calls Left)'
                  ? 'No pending calls left! Great job.'
                  : `No leads found in "${activeFilterTab}" filter.`}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeFilterTab === 'Pending (Calls Left)'
                  ? "You've dialed and logged all of your assigned pending leads for today. Grab a coffee or review follow-ups!"
                  : query
                  ? `No leads matched your search for "${query}". Try resetting filters.`
                  : 'There are currently no records for this selection.'}
              </p>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setActiveFilterTab('All');
                  if (onSearchChange) onSearchChange('');
                  setLocalSearch('');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>View All Leads ({myLeads.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Table of Actionable Leads */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">ID</th>
                  <th className="py-3.5 px-5">Lead Info (Name + Email)</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Current Status</th>
                  <th className="py-3.5 px-6 min-w-[240px]">
                    Action Mechanism (Change Status)
                  </th>
                  <th className="py-3.5 px-4 text-right">Quick Dial</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMyLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      lead.status === 'Pending' ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* ID */}
                    <td className="py-3.5 px-5">
                      <span className="font-mono text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        #{lead.id}
                      </span>
                    </td>

                    {/* Lead Info (Name + Email) */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onOpenLeadDetails(lead)}
                            className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left text-sm"
                          >
                            {lead.name}
                          </button>
                          <PriorityBadge priority={lead.priority} />
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                          <span>{lead.contactPerson || 'Contact'}</span>
                          <span>•</span>
                          <span className="truncate max-w-xs">{lead.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onStartCall(lead)}
                          className="font-mono text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                          title="Click to simulate call"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{lead.phone}</span>
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={lead.status} />
                    </td>

                    {/* THE ACTION MECHANISM (CRUCIAL LOGIC): Inline Status Update Dropdown */}
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        {/* Styled <select> dropdown for direct row update */}
                        <div className="relative flex-1">
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                            aria-label={`Update status for ${lead.name}`}
                            className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                              lead.status === 'Pending'
                                ? 'bg-amber-50 border-amber-300 text-amber-900 focus:bg-white'
                                : lead.status === 'Call Done'
                                ? 'bg-blue-50 border-blue-300 text-blue-900 focus:bg-white'
                                : lead.status === 'Follow-up'
                                ? 'bg-purple-50 border-purple-300 text-purple-900 focus:bg-white'
                                : lead.status === 'Converted'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 focus:bg-white'
                                : 'bg-rose-50 border-rose-300 text-rose-900 focus:bg-white'
                            }`}
                          >
                            <option value="Pending">Pending (Not Called)</option>
                            <option value="Call Done">Call Done (Contacted)</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Converted">Converted (Deal Won)</option>
                            <option value="Dead">Dead (Lost)</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                        </div>

                        {/* Quick 1-click 'Mark Done' button if lead is Pending */}
                        {lead.status === 'Pending' && (
                          <button
                            onClick={() => updateLeadStatus(lead.id, 'Call Done')}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition-all flex items-center gap-1 shrink-0"
                            title="Quick mark as Call Done"
                          >
                            <Check className="w-3 h-3" />
                            <span>Done</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Quick Action Buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartCall(lead)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-[11px] flex items-center gap-1 transition-all"
                          title="Open Outbound Call Console"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call</span>
                        </button>
                        <button
                          onClick={() => onOpenLeadDetails(lead)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="View Details & Notes"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
