import React, { useState, useMemo } from 'react';
import { useLead } from '../context/LeadContext';
import { StatusBadge, PriorityBadge } from './Badge';
import { formatWhatsAppUrl, WhatsAppIcon } from '../utils/phoneUtils';
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  PhoneCall, 
  ExternalLink, 
  ChevronDown,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export const AllLeadsView = ({ onOpenAssignModal, onOpenLeadDetails, onStartCall }) => {
  const { leads, updateLeadStatus, users, addToast } = useLead();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [agentFilter, setAgentFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('id-desc');

  // Filtered and sorted leads
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesSearch = search === '' ||
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone.includes(search) ||
        lead.email.toLowerCase().includes(search.toLowerCase()) ||
        lead.contactPerson.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
      const matchesAgent = agentFilter === 'ALL' || lead.assignedTo === agentFilter;
      const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesAgent && matchesPriority;
    }).sort((a, b) => {
      if (sortBy === 'id-desc') return b.id - a.id;
      if (sortBy === 'id-asc') return a.id - b.id;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'value-desc') return (b.dealValue || 0) - (a.dealValue || 0);
      return 0;
    });
  }, [leads, search, statusFilter, agentFilter, priorityFilter, sortBy]);

  // CSV Export handler
  const handleExportCSV = () => {
    const headers = ['ID', 'Company Name', 'Contact Person', 'Phone', 'Email', 'Assigned Agent', 'Status', 'Priority', 'Deal Value', 'Added Date'];
    const rows = filteredLeads.map(l => [
      l.id,
      `"${l.name}"`,
      `"${l.contactPerson}"`,
      l.phone,
      l.email,
      l.assignedTo,
      l.status,
      l.priority,
      l.dealValue || 0,
      l.addedDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: 'CSV Export Generated',
      message: `Exported ${filteredLeads.length} leads successfully.`,
      type: 'success'
    });
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Comprehensive Leads Database
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {leads.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Filter, search, reassign, or export company leads across all sales reps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenAssignModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Assign New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, contact, phone, email..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Call Done">Call Done</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Converted">Converted</option>
              <option value="Dead">Dead</option>
            </select>
          </div>

          {/* Agent Filter */}
          <div>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="ALL">All Agents</option>
              {users.filter(u => u.role === 'Agent').map(agent => (
                <option key={agent.id} value={agent.name}>{agent.name}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
            >
              <option value="id-desc">Newest First</option>
              <option value="id-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="value-desc">Highest Deal Value</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-5">ID</th>
                <th className="py-3 px-5">Lead / Company</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Assigned Agent</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-5 font-mono text-slate-400 font-bold">
                    #{lead.id}
                  </td>

                  <td className="py-3 px-5">
                    <button
                      onClick={() => onOpenLeadDetails(lead)}
                      className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-left"
                    >
                      {lead.name}
                    </button>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{lead.email}</p>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {lead.contactPerson || '—'}
                  </td>

                  <td className="py-3 px-4 font-mono font-medium">
                    <a
                      href={formatWhatsAppUrl(lead.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs transition-colors"
                      title="Open WhatsApp Chat / Call"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5 fill-emerald-600" />
                      <span>{lead.phone}</span>
                    </a>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {lead.assignedTo}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={lead.status} />
                  </td>

                  <td className="py-3 px-4">
                    <PriorityBadge priority={lead.priority} />
                  </td>

                  <td className="py-3 px-4 font-bold text-slate-700">
                    ${lead.dealValue?.toLocaleString() || '10,000'}
                  </td>

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
                        title="View Details"
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
