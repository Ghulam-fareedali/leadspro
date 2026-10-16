import React from 'react';
import { useLead } from '../context/LeadContext';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  DollarSign,
  ArrowUpRight,
  Shield,
  Layers
} from 'lucide-react';
import { STATUS_CONFIG } from '../data/mockData';

export const AnalyticsView = () => {
  const { leads, adminKPIs, teamPerformance } = useLead();

  const total = leads.length || 1;

  // Counts by status
  const statusCounts = {
    Pending: leads.filter(l => l.status === 'Pending').length,
    'Call Done': leads.filter(l => l.status === 'Call Done').length,
    'Follow-up': leads.filter(l => l.status === 'Follow-up').length,
    Converted: leads.filter(l => l.status === 'Converted').length,
    Dead: leads.filter(l => l.status === 'Dead').length,
  };

  const funnelStages = [
    { label: 'Total Ingested Leads', count: total, pct: 100, color: 'bg-slate-700' },
    { 
      label: 'Outreach Initiated (Calls Made)', 
      count: adminKPIs.totalCallsDone, 
      pct: Math.round((adminKPIs.totalCallsDone / total) * 100), 
      color: 'bg-blue-600' 
    },
    { 
      label: 'Engaged / In Follow-up', 
      count: statusCounts['Follow-up'] + statusCounts.Converted, 
      pct: Math.round(((statusCounts['Follow-up'] + statusCounts.Converted) / total) * 100), 
      color: 'bg-purple-600' 
    },
    { 
      label: 'Deals Won (Converted)', 
      count: statusCounts.Converted, 
      pct: Math.round((statusCounts.Converted / total) * 100), 
      color: 'bg-emerald-600' 
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Call & Conversion Analytics
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Live Pipeline Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time conversion funnels, pipeline distribution, and agent turnaround analytics.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span className="text-slate-500">Total Tracked Pipeline:</span>
          <span className="font-bold text-slate-800 text-sm">
            ${adminKPIs.totalPipelineValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Top 2 visual cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Bar Charts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              Lead Status Distribution
            </h3>
            <span className="text-xs text-slate-400 font-medium">100% of pipeline</span>
          </div>

          <div className="space-y-3">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = Math.round((count / total) * 100);
              const config = STATUS_CONFIG[status];
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
                      {status}
                    </span>
                    <span className="text-slate-500 font-mono">
                      <strong>{count}</strong> ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${config.dotClass}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Outreach Conversion Funnel
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {adminKPIs.conversionRate}% Win Rate
            </span>
          </div>

          <div className="space-y-3">
            {funnelStages.map((stage, i) => (
              <div key={stage.label} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{stage.label}</span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-slate-900">{stage.count} leads</span>
                    <span className="text-slate-400">({stage.pct}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${stage.color}`}
                    style={{ width: `${stage.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Performance Comparison Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          Agent Conversion & Velocity Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamPerformance.map((agent) => (
            <div key={agent.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{agent.name}</h4>
                    <span className="text-[10px] text-slate-400">{agent.title}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {agent.completionRate}% Outreach Done
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Assigned</span>
                  <span className="font-bold text-slate-800">{agent.totalAssigned}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Calls Made</span>
                  <span className="font-bold text-emerald-600">{agent.callsCompleted}</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Converted</span>
                  <span className="font-bold text-purple-600">{agent.converted}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
