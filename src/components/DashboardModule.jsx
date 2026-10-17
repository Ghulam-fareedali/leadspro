import React from 'react';
import { useCrm } from '../context/CrmContext';
import { StatusBadge } from './StatusBadge';
import { 
  Database, 
  PhoneForwarded, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  ArrowRight, 
  Users2, 
  Flame, 
  Layers, 
  ArrowRightLeft,
  Sparkles,
  PieChart,
  BarChart3,
  Inbox,
  PhoneOff,
  PhoneMissed
} from 'lucide-react';

export const DashboardModule = ({ onOpenUpload }) => {
  const { analytics, setActiveTab, statusConfig } = useCrm();

  const total = analytics.totalLeadsAssigned || 1;

  const statuses = [
    {
      key: 'Pending',
      name: 'Pending',
      count: analytics.pendingCount,
      percentage: analytics.statusPercentages.Pending,
      icon: Clock,
      theme: {
        cardBg: 'bg-amber-50/40',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        badgeBg: 'bg-amber-100 text-amber-800',
        barBg: 'bg-amber-400',
        sub: 'Default state upon assignment. Awaiting initial outreach.'
      }
    },
    {
      key: 'Connected',
      name: 'Connected',
      count: analytics.connectedCount,
      percentage: analytics.statusPercentages.Connected,
      icon: PhoneCall,
      theme: {
        cardBg: 'bg-blue-50/40',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        badgeBg: 'bg-blue-100 text-blue-800',
        barBg: 'bg-blue-500',
        sub: 'Contact established. Active discovery or negotiation.'
      }
    },
    {
      key: 'Not Connected',
      name: 'Not Connected',
      count: analytics.notConnectedCount || 0,
      percentage: analytics.statusPercentages['Not Connected'] || 0,
      icon: PhoneMissed,
      theme: {
        cardBg: 'bg-orange-50/40',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        badgeBg: 'bg-orange-100 text-orange-800',
        barBg: 'bg-orange-500',
        sub: 'Call placed but not answered or busy. Scheduled for redial.'
      }
    },
    {
      key: 'Interested',
      name: 'Interested (Hot)',
      count: analytics.interestedCount,
      percentage: analytics.statusPercentages.Interested,
      icon: CheckCircle2,
      theme: {
        cardBg: 'bg-emerald-50/40',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-800',
        badgeBg: 'bg-emerald-100 text-emerald-800',
        barBg: 'bg-emerald-500',
        sub: 'High intent hot leads. Proposal requested or ready to win.'
      }
    },
    {
      key: 'Not Interested',
      name: 'Not Interested',
      count: analytics.notInterestedCount,
      percentage: analytics.statusPercentages['Not Interested'],
      icon: XCircle,
      theme: {
        cardBg: 'bg-rose-50/40',
        borderColor: 'border-rose-200',
        textColor: 'text-rose-800',
        badgeBg: 'bg-rose-100 text-rose-800',
        barBg: 'bg-rose-500',
        sub: 'Declined or disqualified. Removed from active pipeline.'
      }
    },
    {
      key: 'Not on WhatsApp',
      name: 'Not on WhatsApp',
      count: analytics.notOnWhatsAppCount,
      percentage: analytics.statusPercentages['Not on WhatsApp'],
      icon: PhoneOff,
      theme: {
        cardBg: 'bg-slate-100/60',
        borderColor: 'border-slate-300',
        textColor: 'text-slate-800',
        badgeBg: 'bg-slate-200 text-slate-800',
        barBg: 'bg-slate-500',
        sub: 'Not registered on WhatsApp. Call directly via regular cellular dialer.'
      }
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. CLEAN MODERN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Pipeline Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time conversion metrics, customer pool, and team performance.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('customers')}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all border border-blue-200 cursor-pointer"
          >
            + Customers Pool
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Leads Pipeline →
          </button>
        </div>
      </div>

      {/* 2. TOP KPI SUMMARY METRIC CARDS (2x2 on Mobile, 4-col on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Customers Pool */}
        <div 
          onClick={() => setActiveTab('customers')}
          className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Customers Pool
              </p>
              <h3 className="text-xl sm:text-3xl font-extrabold text-slate-800 mt-0.5 sm:mt-1">
                {analytics.totalCustomersPool}
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
              <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Raw Ingestion</span>
            <span className="text-blue-600 font-bold flex items-center gap-0.5">
              <span>View</span> <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Total Leads Assigned */}
        <div 
          onClick={() => setActiveTab('leads')}
          className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Leads Assigned
              </p>
              <h3 className="text-xl sm:text-3xl font-extrabold text-blue-600 mt-0.5 sm:mt-1">
                {analytics.totalLeadsAssigned}
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PhoneForwarded className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">In Pipeline</span>
            <span className="text-blue-600 font-bold flex items-center gap-0.5">
              <span>View</span> <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 3: Unassigned Customer Backlog */}
        <div 
          onClick={() => setActiveTab('customers')}
          className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-600">
                Unassigned Pool
              </p>
              <h3 className="text-xl sm:text-3xl font-extrabold text-amber-600 mt-0.5 sm:mt-1">
                {analytics.unassignedCount}
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Inbox className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Pending dispatch</span>
            <span className="text-amber-700 font-bold flex items-center gap-0.5">
              <span>Assign</span> <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Conversion / High Interest Rate */}
        <div 
          onClick={() => setActiveTab('leads')}
          className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-600">
                Hot Leads Rate
              </p>
              <h3 className="text-xl sm:text-3xl font-extrabold text-emerald-600 mt-0.5 sm:mt-1">
                {analytics.interestRate}%
              </h3>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">{analytics.interestedCount} hot leads</span>
            <span className="text-emerald-700 font-bold">Ready</span>
          </div>
        </div>
      </div>

      {/* 3. PIPELINE STATUS BREAKDOWN (REQUIRED) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Pipeline Status Breakdown
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {analytics.totalLeadsAssigned} Assigned Leads Tracked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status distribution across all stages: Pending, Connected, Not Connected, Interested, and Not Interested.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('leads')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Pipeline Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Visual Multi-Segment Pipeline Funnel Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Visual Pipeline Progression</span>
            <span>{analytics.totalLeadsAssigned} Active Records</span>
          </div>

          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            {analytics.pendingCount > 0 && (
              <div
                style={{ width: `${(analytics.pendingCount / total) * 100}%` }}
                className="bg-amber-400 h-full transition-all duration-500 hover:opacity-90 relative group"
                title={`Pending: ${analytics.pendingCount} (${analytics.statusPercentages.Pending}%)`}
              />
            )}
            {analytics.connectedCount > 0 && (
              <div
                style={{ width: `${(analytics.connectedCount / total) * 100}%` }}
                className="bg-blue-500 h-full transition-all duration-500 hover:opacity-90 relative group"
                title={`Connected: ${analytics.connectedCount} (${analytics.statusPercentages.Connected}%)`}
              />
            )}
            {analytics.notConnectedCount > 0 && (
              <div
                style={{ width: `${(analytics.notConnectedCount / total) * 100}%` }}
                className="bg-orange-500 h-full transition-all duration-500 hover:opacity-90 relative group"
                title={`Not Connected: ${analytics.notConnectedCount} (${analytics.statusPercentages['Not Connected']}%)`}
              />
            )}
            {analytics.interestedCount > 0 && (
              <div
                style={{ width: `${(analytics.interestedCount / total) * 100}%` }}
                className="bg-emerald-500 h-full transition-all duration-500 hover:opacity-90 relative group"
                title={`Interested: ${analytics.interestedCount} (${analytics.statusPercentages.Interested}%)`}
              />
            )}
            {analytics.notInterestedCount > 0 && (
              <div
                style={{ width: `${(analytics.notInterestedCount / total) * 100}%` }}
                className="bg-rose-500 h-full transition-all duration-500 hover:opacity-90 relative group"
                title={`Not Interested: ${analytics.notInterestedCount} (${analytics.statusPercentages['Not Interested']}%)`}
              />
            )}
            {analytics.notOnWhatsAppCount > 0 && (
              <div
                style={{ width: `${(analytics.notOnWhatsAppCount / total) * 100}%` }}
                className="bg-slate-500 h-full transition-all duration-500 hover:opacity-90 relative group"
                title={`Not on WhatsApp: ${analytics.notOnWhatsAppCount} (${analytics.statusPercentages['Not on WhatsApp']}%)`}
              />
            )}
          </div>

          {/* Bar Legend */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Pending ({analytics.statusPercentages.Pending}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Connected ({analytics.statusPercentages.Connected}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 font-semibold" />
              <span>Not Connected ({analytics.statusPercentages['Not Connected']}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 font-semibold" />
              <span>Interested ({analytics.statusPercentages.Interested}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Not Interested ({analytics.statusPercentages['Not Interested']}%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
              <span>Not on WhatsApp ({analytics.statusPercentages['Not on WhatsApp']}%)</span>
            </span>
          </div>
        </div>

        {/* 6 Status Cards Grid (2-col mobile, 3-col sm, 6-col desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 pt-1">
          {statuses.map((st) => {
            const Icon = st.icon;
            return (
              <div
                key={st.key}
                onClick={() => setActiveTab('leads')}
                className={`p-3 sm:p-4 rounded-xl border ${st.theme.borderColor} ${st.theme.cardBg} transition-all hover:shadow-md cursor-pointer space-y-2 sm:space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${st.theme.badgeBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-800 text-xs">
                      {st.name}
                    </span>
                  </div>
                  <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${st.theme.badgeBg}`}>
                    {st.percentage}%
                  </span>
                </div>

                <div>
                  <span className={`text-2xl font-extrabold ${st.theme.textColor}`}>
                    {st.count}
                  </span>
                  <span className="text-xs text-slate-500 ml-1.5 font-medium">leads</span>
                </div>

                <div className="w-full bg-white/70 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`${st.theme.barBg} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${st.percentage}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">
                  {st.theme.sub}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. AGENT ALLOCATION & STATUS BREAKDOWN TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Agent Workload & Conversion Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status counts breakdown by individual sales representative.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('team')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Team Overview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Agent Name</th>
                <th className="py-3 px-3">Total Leads</th>
                <th className="py-3 px-3 text-amber-700">1. Pending</th>
                <th className="py-3 px-3 text-blue-700">2. Connected</th>
                <th className="py-3 px-3 text-orange-700">3. Not Connected</th>
                <th className="py-3 px-3 text-emerald-700">4. Interested</th>
                <th className="py-3 px-3 text-rose-700">5. Not Int.</th>
                <th className="py-3 px-3 text-slate-700">6. 📵 Not on WA</th>
                <th className="py-3 px-4 text-right">Interest Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.agentBreakdown.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={agent.avatar}
                        alt={agent.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{agent.name}</p>
                        <p className="text-[10px] text-slate-400">{agent.role}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-bold text-slate-800">
                    {agent.totalLeads}
                  </td>

                  <td className="py-3 px-3 font-semibold text-amber-600">
                    {agent.pending}
                  </td>

                  <td className="py-3 px-3 font-semibold text-blue-600">
                    {agent.connected}
                  </td>

                  <td className="py-3 px-3 font-semibold text-orange-600">
                    {agent.notConnected || 0}
                  </td>

                  <td className="py-3 px-3 font-bold text-emerald-600">
                    {agent.interested}
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-400">
                    {agent.notInterested}
                  </td>

                  <td className="py-3 px-3 font-semibold text-slate-600">
                    {agent.notOnWhatsApp || 0}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <span className="font-bold text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {agent.conversionRate}%
                    </span>
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
