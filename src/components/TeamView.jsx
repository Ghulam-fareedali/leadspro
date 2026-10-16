import React from 'react';
import { useLead } from '../context/LeadContext';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  PhoneCall, 
  Clock, 
  CheckCircle2, 
  Award, 
  TrendingUp, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const TeamView = ({ onSelectAgentToTest }) => {
  const { users, leads, teamPerformance, switchUser, currentUser } = useLead();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
              Sales Team Roster & Quotas
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {users.length} Team Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review agent capacity, calls made, and individual conversion rates. Click any agent to switch to their view.
          </p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => {
          const isCurrent = currentUser.id === user.id;
          const userLeads = leads.filter(l => l.assignedTo === user.name);
          const totalAssigned = userLeads.length;
          const completedCalls = userLeads.filter(l => l.status !== 'Pending').length;
          const pendingCalls = userLeads.filter(l => l.status === 'Pending').length;
          const convertedDeals = userLeads.filter(l => l.status === 'Converted').length;
          const completionRate = totalAssigned > 0 ? Math.round((completedCalls / totalAssigned) * 100) : 100;

          return (
            <div
              key={user.id}
              className={`bg-white rounded-2xl border p-6 shadow-sm transition-all relative overflow-hidden flex flex-col justify-between ${
                isCurrent
                  ? 'border-blue-500 ring-2 ring-blue-500/10'
                  : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-xs">
                  Active User
                </div>
              )}

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-xs"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{user.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        user.role === 'Admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{user.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
                  </div>
                </div>

                {/* Agent Stats (if Agent) */}
                {user.role === 'Agent' ? (
                  <div className="space-y-4 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned</span>
                        <span className="text-base font-bold text-slate-800">{totalAssigned}</span>
                      </div>
                      <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100">
                        <span className="text-[10px] text-blue-500 font-bold block uppercase">Completed</span>
                        <span className="text-base font-bold text-blue-700">{completedCalls}</span>
                      </div>
                      <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100">
                        <span className="text-[10px] text-amber-500 font-bold block uppercase">Pending</span>
                        <span className="text-base font-bold text-amber-700">{pendingCalls}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Outreach Completion</span>
                        <span className="font-bold text-slate-800">{completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        Won Deals: <strong>{convertedDeals}</strong>
                      </span>
                      <span>
                        Rate: <strong>{completedCalls > 0 ? Math.round((convertedDeals / completedCalls) * 100) : 0}%</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-2 mt-3">
                    <div className="flex items-center gap-2 font-bold text-blue-800">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Executive Oversight</span>
                    </div>
                    <p className="text-blue-700 leading-relaxed text-[11px]">
                      Ali oversees global lead assignments, team quotas, performance analysis, and enterprise pipeline management.
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Switch Button */}
              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => switchUser(user.id)}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-slate-900 hover:bg-blue-600 text-white shadow-xs'
                  }`}
                  disabled={isCurrent}
                >
                  <span>{isCurrent ? 'Currently Active' : `Switch to ${user.name}'s View`}</span>
                  {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
