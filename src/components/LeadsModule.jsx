import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useCrm } from '../context/CrmContext';
import { StatusBadge, SourceBadge } from './StatusBadge';
import { 
  PhoneForwarded, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  Check, 
  ArrowRight,
  Database,
  Flame,
  Download,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';

export const LeadsModule = ({ searchQuery, setSearchQuery }) => {
  const { 
    leads, 
    agents, 
    updateLeadStatus, 
    deleteLead,
    analytics, 
    setActiveTab, 
    statusConfig,
    addToast
  } = useCrm();

  const [activeStatusTab, setActiveStatusTab] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = !searchQuery ||
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phone.includes(searchQuery) ||
        lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.assignedAgent.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeStatusTab !== 'ALL' && lead.status !== activeStatusTab) return false;

      if (agentFilter !== 'ALL' && lead.assignedAgent !== agentFilter) return false;

      return true;
    });
  }, [leads, searchQuery, activeStatusTab, agentFilter]);

  const statusTabs = [
    {
      id: 'ALL',
      label: 'All Assigned Leads',
      count: leads.length,
      badgeClass: 'bg-slate-200 text-slate-700'
    },
    {
      id: 'Pending',
      label: 'Pending',
      count: analytics.pendingCount,
      badgeClass: 'bg-amber-100 text-amber-800 font-bold',
      desc: 'Awaiting outreach'
    },
    {
      id: 'Connected',
      label: 'Connected',
      count: analytics.connectedCount,
      badgeClass: 'bg-blue-100 text-blue-800 font-bold',
      desc: 'In discussions'
    },
    {
      id: 'Interested',
      label: 'Interested (Hot)',
      count: analytics.interestedCount,
      badgeClass: 'bg-emerald-100 text-emerald-800 font-bold',
      desc: 'Ready to convert'
    },
    {
      id: 'Not Interested',
      label: 'Not Interested',
      count: analytics.notInterestedCount,
      badgeClass: 'bg-rose-100 text-rose-800 font-bold',
      desc: 'Dead leads'
    }
  ];

  // Export current leads view to real Excel (.xlsx) file
  const handleExportLeadsExcel = () => {
    const exportRows = filteredLeads.map(l => ({
      "Lead ID": l.id,
      "Customer Reference": l.customerId,
      "Lead / Company Name": l.name,
      "Phone Number": l.phone,
      "Email Address": l.email,
      "Assigned Agent": l.assignedAgent,
      "Pipeline Status": l.status,
      "Source Origin": l.source,
      "Assigned Date": l.assignedDate,
      "Last Contacted": l.lastContactDate || "Not contacted yet",
      "Agent Notes": l.notes
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads_Pipeline");
    XLSX.writeFile(workbook, `OmniFlow_Leads_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    addToast({
      title: 'Excel Export Complete',
      message: `Exported ${exportRows.length} active leads to .xlsx file.`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. SECTION HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <PhoneForwarded className="w-4 h-4" />
            </div>
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Action Pipeline (Assigned Leads)
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {leads.length} in Active Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracks active communications and sales conversions. Records originate from the <strong>Customers</strong> data pool upon agent assignment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportLeadsExcel}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
            title="Download current leads list as Excel spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export to Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-500/25"
          >
            <Database className="w-4 h-4" />
            <span>Go to Raw Customers Pool</span>
          </button>
        </div>
      </div>

      {/* 2. QUICK-FILTER TABS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {statusTabs.map((tab) => {
              const isActive = activeStatusTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatusTab(tab.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[11px] px-2 py-0.2 rounded-full font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.badgeClass
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold shrink-0">Filter Agent:</span>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Agents ({leads.length})</option>
              {agents.map((agent) => {
                const count = leads.filter(l => l.assignedAgent === agent.name).length;
                return (
                  <option key={agent.id} value={agent.name}>
                    {agent.name} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* 3. ASSIGNED LEADS TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Lead ID</th>
                <th className="py-3.5 px-5">Lead Name</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Assigned Agent</th>
                <th className="py-3.5 px-6 min-w-[220px]">Status (Interactive Dropdown)</th>
                <th className="py-3.5 px-4">Source / Origin</th>
                <th className="py-3.5 px-4 text-right">Quick Contact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <PhoneForwarded className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-600">No leads in this filter</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {leads.length === 0
                        ? 'Assign raw customers from the Customers section to build your leads pipeline.'
                        : 'Try changing the status tabs or clearing the search query.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      lead.status === 'Pending' ? 'bg-amber-50/15' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {lead.id}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          from {lead.customerId}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-5">
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">
                          {lead.name}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">
                          {lead.email || 'No email registered'}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">
                      <a href={`tel:${lead.phone}`} className="hover:underline flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{lead.phone}</span>
                      </a>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          {lead.assignedAgent.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {lead.assignedAgent}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <div className="relative">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                          aria-label={`Update status for ${lead.name}`}
                          className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                            lead.status === 'Pending'
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : lead.status === 'Connected'
                              ? 'bg-blue-50 border-blue-300 text-blue-900'
                              : lead.status === 'Interested'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-rose-50 border-rose-300 text-rose-900'
                          }`}
                        >
                          <option value="Pending">1. Pending (Awaiting Outreach)</option>
                          <option value="Connected">2. Connected (Contact Made)</option>
                          <option value="Interested">3. Interested (Hot Lead 🔥)</option>
                          <option value="Not Interested">4. Not Interested (Dead Lead ✕)</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <SourceBadge source={lead.source} />
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        {lead.status === 'Pending' ? (
                          <button
                            onClick={() => updateLeadStatus(lead.id, 'Connected')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-xs transition-all inline-flex items-center gap-1"
                            title="Mark Connected upon first call"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call Done</span>
                          </button>
                        ) : (
                          <StatusBadge status={lead.status} size="sm" />
                        )}

                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove lead from pipeline"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
