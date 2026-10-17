import React, { useState } from 'react';
import { useLead } from '../context/LeadContext';
import { KpiCard } from './KpiCard';
import { StatusBadge, PriorityBadge } from './Badge';
import { formatWhatsAppUrl, WhatsAppIcon } from '../utils/phoneUtils';
import { 
  Users, 
  PhoneCall, 
  Clock, 
  TrendingUp, 
  UserPlus, 
  CheckCircle2, 
  ArrowUpRight, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminDashboard = ({ onOpenAssignModal, onOpenLeadDetails, onStartCall, searchQuery }) => {
  const { 
    adminKPIs, 
    teamPerformance, 
    leads, 
    updateLeadStatus, 
    users 
  } = useLead();

  const [selectedAgentFilter, setSelectedAgentFilter] = useState('ALL');

  // Filter leads for the quick preview table
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchQuery === '' || 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAgent = selectedAgentFilter === 'ALL' || lead.assignedTo === selectedAgentFilter;

    return matchesSearch && matchesAgent;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        {/* Subtle decorative background gradient circles */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-40 h-40 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
            <Shield className="w-3.5 h-3.5 text-blue-300" />
            <span>Admin Executive Console</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
            Sales & Tele-Outreach Overview
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 max-w-xl">
            Live monitoring of lead distribution, agent call quotas, conversion funnels, and pending queues.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={onOpenAssignModal}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/40 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Assign New Lead</span>
          </button>
        </div>
      </div>

      {/* 1. GLOBAL KPI CARDS (TOP ROW) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Leads */}
        <KpiCard
          title="Total Leads"
          value={adminKPIs.totalLeads}
          subtitle="All active leads in database"
          icon={Users}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
          trend="100% indexed"
          trendPositive={true}
          badgeText="Global"
        />

        {/* KPI 2: Total Calls Done */}
        <KpiCard
          title="Total Calls Done"
          value={adminKPIs.totalCallsDone}
          subtitle="Leads with status != Pending"
          icon={PhoneCall}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          trend={`${Math.round((adminKPIs.totalCallsDone / (adminKPIs.totalLeads || 1)) * 100)}% of quota`}
          trendPositive={true}
          badgeText="Active"
        />

        {/* KPI 3: Remaining / Pending */}
        <KpiCard
          title="Remaining / Pending"
          value={adminKPIs.pendingLeads}
          subtitle="Waiting for initial agent outreach"
          icon={Clock}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
          trend={`${adminKPIs.pendingLeads} awaiting calls`}
          trendPositive={adminKPIs.pendingLeads === 0}
          badgeText="Action Needed"
        />

        {/* KPI 4: Conversion Rate */}
        <KpiCard
          title="Conversion Rate"
          value={`${adminKPIs.conversionRate}%`}
          subtitle={`${adminKPIs.convertedLeads} won deals`}
          icon={TrendingUp}
          iconBg="bg-purple-50 text-purple-600 border-purple-100"
          trend="+4.2% vs target"
          trendPositive={true}
          badgeText="Won Deals"
        />
      </div>

      {/* 2. TEAM PERFORMANCE SECTION */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Team Performance</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {teamPerformance.length} Active Agents
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative metrics tracking calls completed against assigned lead workloads.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Quick Filter:</span>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setSelectedAgentFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  selectedAgentFilter === 'ALL'
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              {teamPerformance.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentFilter(agent.name)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    selectedAgentFilter === agent.name
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {agent.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Team Performance Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">Agent Name</th>
                <th className="py-3 px-4">Assigned Leads (Total)</th>
                <th className="py-3 px-4">Calls Completed</th>
                <th className="py-3 px-4">Pending Calls</th>
                <th className="py-3 px-6 min-w-[200px]">Performance Progress Bar</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teamPerformance.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Agent Name */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">
                          {agent.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          {agent.title}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Assigned Leads */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-sm">{agent.totalAssigned}</span>
                      <span className="text-slate-400 text-[11px]">leads</span>
                    </div>
                  </td>

                  {/* Calls Completed */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-600 text-sm">{agent.callsCompleted}</span>
                      <span className="text-slate-400 text-[11px]">completed</span>
                    </div>
                  </td>

                  {/* Pending Calls */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`font-bold text-sm ${
                        agent.pendingCalls > 0 ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        {agent.pendingCalls}
                      </span>
                      <span className="text-slate-400 text-[11px]">remaining</span>
                    </div>
                  </td>

                  {/* Performance Progress Bar */}
                  <td className="py-3.5 px-6">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-500 font-medium">Completion Rate</span>
                        <span className="font-bold text-slate-800">
                          {agent.completionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            agent.completionRate >= 75
                              ? 'bg-gradient-to-r from-blue-500 to-emerald-500'
                              : agent.completionRate >= 50
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                              : 'bg-gradient-to-r from-amber-400 to-amber-500'
                          }`}
                          style={{ width: `${agent.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedAgentFilter(agent.name)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 font-semibold transition-all"
                    >
                      <span>Filter Leads</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. RECENT LEADS & DISPATCH DIRECTORY */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                All Leads Directory (Admin Dispatch)
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {filteredLeads.length} leads
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live database of assigned leads. You can inspect leads, override status, or reassign instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAssignModal}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ New Lead</span>
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Lead / Company</th>
                <th className="py-3 px-4">Contact & Phone</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* ID */}
                  <td className="py-3 px-5 font-mono text-slate-500 font-bold">
                    #{lead.id}
                  </td>

                  {/* Company */}
                  <td className="py-3 px-5">
                    <div>
                      <button
                        onClick={() => onOpenLeadDetails(lead)}
                        className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                      >
                        {lead.name}
                      </button>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">{lead.email}</p>
                    </div>
                  </td>

                  {/* Contact & Phone */}
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-slate-700">{lead.contactPerson || '—'}</p>
                      <a
                        href={formatWhatsAppUrl(lead.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-mono text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 mt-0.5"
                        title="Click to open WhatsApp"
                      >
                        <WhatsAppIcon className="w-3 h-3 fill-emerald-600" />
                        <span>{lead.phone}</span>
                      </a>
                    </div>
                  </td>

                  {/* Assigned Agent */}
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {lead.assignedTo}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <StatusBadge status={lead.status} />
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4">
                    <PriorityBadge priority={lead.priority} />
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onStartCall(lead)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Simulate Call"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onOpenLeadDetails(lead)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="View Full Details"
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
      </div>
    </div>
  );
};
