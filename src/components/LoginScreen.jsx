import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  ShieldCheck, 
  KeyRound, 
  Users2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowRightLeft,
  PhoneCall,
  Database
} from 'lucide-react';

export const LoginScreen = () => {
  const { agents, loginAdmin, loginAgentPin, dbStatus } = useCrm();

  // Active Login Mode: 'admin' | 'agent'
  const [activeMode, setActiveMode] = useState('admin');

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('admin@omniflow.io');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Agent PIN form state
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || 1);
  const [agentPin, setAgentPin] = useState('');
  const [showAgentPin, setShowAgentPin] = useState(false);

  // Error feedback
  const [errorMsg, setErrorMsg] = useState('');

  const selectedAgent = agents.find(a => String(a.id) === String(selectedAgentId)) || agents[0];

  // Submit Admin Login
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!adminEmail.trim()) {
      setErrorMsg('Please enter an admin email.');
      return;
    }
    loginAdmin({ email: adminEmail });
  };

  // Submit Agent PIN Login
  const handleAgentSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!agentPin.trim()) {
      setErrorMsg(`Please enter the 4-digit PIN for ${selectedAgent?.name || 'this agent'}.`);
      return;
    }

    const res = loginAgentPin(selectedAgentId, agentPin.trim());
    if (!res.success) {
      setErrorMsg(`Incorrect PIN for ${selectedAgent?.name}. (Default demo PIN is: ${selectedAgent?.pin || '1234'})`);
    }
  };

  // Quick One-Click Agent Login
  const handleQuickAgentLogin = (agent) => {
    setSelectedAgentId(agent.id);
    setAgentPin(agent.pin || '1234');
    setErrorMsg('');
    loginAgentPin(agent.id, agent.pin || '1234');
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans text-slate-100 relative overflow-hidden select-none">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Branding */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">OmniFlow</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
                CRM Portal
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Lead & Team Dispatch</p>
          </div>
        </div>

        {/* Database Status Chip */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs">
          <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
          <span className="text-slate-300 text-[11px] font-semibold">
            {dbStatus?.connected ? 'MongoDB Live' : 'Serverless API Active'}
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="max-w-md w-full mx-auto my-auto py-8 z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
          
          {/* Portal Selector Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveMode('admin'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeMode === 'admin'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveMode('agent'); setErrorMsg(''); }}
              className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeMode === 'agent'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Team PIN Login</span>
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {activeMode === 'admin' ? 'Administrator Login' : 'Team Member PIN Portal'}
            </h2>
            <p className="text-xs text-slate-400">
              {activeMode === 'admin'
                ? 'Sign in with admin credentials to manage raw pool, assign leads & team PINs.'
                : 'Select your team member profile and enter your 4-digit PIN assigned by Admin.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. ADMIN LOGIN FORM */}
          {activeMode === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@omniflow.io"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-400/30"
              >
                <span>Sign In as Admin</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Button */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => loginAdmin({ email: 'admin@omniflow.io' })}
                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>One-Click Quick Admin Demo</span>
                </button>
              </div>
            </form>
          )}

          {/* 2. TEAM MEMBER PIN LOGIN FORM */}
          {activeMode === 'agent' && (
            <form onSubmit={handleAgentSubmit} className="space-y-4">
              {/* Agent Picker Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Select Team Member</label>
                <div className="grid grid-cols-1 gap-2">
                  <select
                    value={selectedAgentId}
                    onChange={(e) => {
                      setSelectedAgentId(Number(e.target.value));
                      setAgentPin('');
                      setErrorMsg('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {agents.map((agent) => (
                      <option key={agent.id} value={agent.id} className="bg-slate-900 text-white">
                        {agent.name} — {agent.role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Agent Preview Badge */}
              {selectedAgent && (
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedAgent.avatar}
                      alt={selectedAgent.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{selectedAgent.name}</p>
                      <p className="text-[10px] text-indigo-300">{selectedAgent.role}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-semibold">
                    PIN Protected
                  </span>
                </div>
              )}

              {/* 4-Digit PIN Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Enter 4-Digit Security PIN
                  </label>
                  {selectedAgent?.pin && (
                    <span className="text-[10px] text-slate-400">
                      Default: <code className="bg-slate-800 px-1 py-0.5 rounded text-amber-300 font-bold">{selectedAgent.pin}</code>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showAgentPin ? 'text' : 'password'}
                    maxLength={6}
                    value={agentPin}
                    onChange={(e) => setAgentPin(e.target.value)}
                    placeholder="••••"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950/60 border border-slate-700/80 rounded-xl text-center font-mono tracking-widest text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowAgentPin(!showAgentPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showAgentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/30"
              >
                <span>Unlock {selectedAgent?.name || 'Agent'} Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Login Chips for All Agents */}
              <div className="pt-2 space-y-1.5 border-t border-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center">
                  Quick Demo Access (Click to Login)
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {agents.slice(0, 4).map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => handleQuickAgentLogin(agent)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-500/50 text-[11px] font-medium text-slate-300 hover:text-white transition-all text-left flex items-center gap-1.5 truncate"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate">{agent.name}</span>
                      <span className="text-[9px] text-amber-300 ml-auto font-mono">({agent.pin || '1234'})</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

        </div>
      </main>

      {/* Footer Features Summary */}
      <footer className="max-w-4xl w-full mx-auto text-center text-[11px] text-slate-400 space-y-1.5 z-10">
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            Admin: Full Data Pool & Team PIN Management
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            Team Member: PIN-Protected Actionable Leads
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Real-time Pipeline Status Sync
          </span>
        </div>
        <p className="text-slate-400">
          OmniFlow CRM v3.2 • Designed for Enterprise Sales Operations
        </p>
      </footer>
    </div>
  );
};
