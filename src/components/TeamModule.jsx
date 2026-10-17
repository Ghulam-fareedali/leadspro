import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { 
  Users2, 
  UserPlus, 
  Pencil, 
  Trash2, 
  PhoneForwarded, 
  Clock, 
  PhoneCall, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ArrowRight, 
  Mail, 
  Phone, 
  X, 
  AlertTriangle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Lock
} from 'lucide-react';

export const TeamModule = () => {
  const { 
    agents, 
    leads, 
    analytics, 
    addAgent, 
    updateAgent, 
    updateAgentPin,
    removeAgent, 
    setActiveTab 
  } = useCrm();

  // Modal State for Add / Edit
  const [agentModal, setAgentModal] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit'
    agentId: null,
    formData: {
      name: '',
      role: 'Sales Representative',
      email: '',
      phone: '',
      avatar: '',
      pin: ''
    }
  });

  // Modal State for Delete Confirmation
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    agent: null
  });

  // Modal State for Quick PIN Assignment
  const [pinModal, setPinModal] = useState({
    isOpen: false,
    agent: null,
    newPin: ''
  });

  const [formError, setFormError] = useState('');

  // Open modal in Add mode
  const handleOpenAddModal = () => {
    setFormError('');
    setAgentModal({
      isOpen: true,
      mode: 'add',
      agentId: null,
      formData: {
        name: '',
        role: 'Sales Representative',
        email: '',
        phone: '',
        avatar: '',
        pin: ''
      }
    });
  };

  // Open modal in Edit mode
  const handleOpenEditModal = (agent) => {
    setFormError('');
    setAgentModal({
      isOpen: true,
      mode: 'edit',
      agentId: agent.id,
      formData: {
        name: agent.name,
        role: agent.role,
        email: agent.email,
        phone: agent.phone || '0300-1234567',
        avatar: agent.avatar,
        pin: agent.pin || '1234'
      }
    });
  };

  // Open Quick PIN Assignment Modal
  const handleOpenPinModal = (agent) => {
    setPinModal({
      isOpen: true,
      agent,
      newPin: agent.pin || '1234'
    });
  };

  // Save PIN from Quick Modal
  const handleSavePin = (e) => {
    e.preventDefault();
    if (!pinModal.newPin.trim()) return;
    updateAgentPin(pinModal.agent.id, pinModal.newPin.trim());
    setPinModal({ isOpen: false, agent: null, newPin: '' });
  };

  // Submit Add or Edit
  const handleSubmitAgent = (e) => {
    e.preventDefault();
    if (!agentModal.formData.name.trim()) {
      setFormError('Please enter the team member name.');
      return;
    }

    if (agentModal.mode === 'add') {
      addAgent(agentModal.formData);
    } else {
      updateAgent(agentModal.agentId, agentModal.formData);
    }

    setAgentModal({ isOpen: false, mode: 'add', agentId: null, formData: { name: '', role: '', email: '', phone: '', avatar: '', pin: '1234' } });
  };

  // Open prompt to delete agent
  const handlePromptDeleteAgent = (agent) => {
    setDeleteModal({
      isOpen: true,
      agent
    });
  };

  // Confirm delete agent
  const handleConfirmRemoveAgent = () => {
    if (!deleteModal.agent) return;
    removeAgent(deleteModal.agent.id);
    setDeleteModal({ isOpen: false, agent: null });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. CLEAN HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Team Members & PINs
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {agents.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage sales representatives and their private security login PINs.
          </p>
        </div>

        {/* Action Button: Add Team Member */}
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/25 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Member</span>
        </button>
      </div>

      {/* 2. AGENTS ROSTER GRID */}
      {agents.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Users2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Team Members Added</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no sales reps in your roster. Click the button below to add your first team member.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all inline-flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {analytics.agentBreakdown.map((agent) => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
            >
              {/* Card Header & Controls */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-100 shadow-xs"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-blue-600 font-semibold">{agent.role}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[150px]">{agent.email}</p>
                    </div>
                  </div>

                  {/* Edit & Remove Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(agent)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit / Rename Team Member"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handlePromptDeleteAgent(agent)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove Member from Team"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status breakdown grid */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs pt-2 border-t border-slate-100">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total</span>
                    <span className="text-base font-extrabold text-slate-800">{agent.totalLeads}</span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">Pending</span>
                    <span className="text-base font-extrabold text-amber-700">{agent.pending}</span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <span className="text-[10px] uppercase font-bold text-blue-600 block">Connected</span>
                    <span className="text-base font-extrabold text-blue-700">{agent.connected}</span>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                    <span className="text-[10px] uppercase font-bold text-orange-600 block">Not Conn.</span>
                    <span className="text-base font-extrabold text-orange-700">{agent.notConnected || 0}</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Interested</span>
                    <span className="text-base font-extrabold text-emerald-700">{agent.interested}</span>
                  </div>
                  <div className="bg-rose-50 p-2 rounded-lg border border-rose-100">
                    <span className="text-[10px] uppercase font-bold text-rose-600 block">Not Int.</span>
                    <span className="text-base font-extrabold text-rose-700">{agent.notInterested}</span>
                  </div>
                </div>

                {/* Interest / Conversion Rate */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Interest Win Rate</span>
                    <span className="font-bold text-slate-800">{agent.conversionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${agent.conversionRate}%` }}
                    />
                  </div>
                </div>

                {/* Security PIN Section (Admin Manageable) */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <KeyRound className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Portal PIN</span>
                      <span className="font-mono font-bold text-slate-800 text-xs">
                        {agent.pin || '1234'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenPinModal(agent)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    title="Assign or change login PIN for this agent"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Change PIN</span>
                  </button>
                </div>
              </div>

              {/* View Leads Action */}
              <button
                onClick={() => setActiveTab('leads')}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>View {agent.name.split(' ')[0]}'s Leads ({agent.totalLeads})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. ADD / EDIT TEAM MEMBER MODAL */}
      {agentModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {agentModal.mode === 'add' ? 'Add New Team Member' : 'Edit Team Member Details'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {agentModal.mode === 'add'
                      ? 'Create an agent for receiving customer lead assignments'
                      : 'Update name, job title, and contact details'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAgentModal({ ...agentModal, isOpen: false })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitAgent} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Team Member Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={agentModal.formData.name}
                  onChange={(e) => setAgentModal({
                    ...agentModal,
                    formData: { ...agentModal.formData, name: e.target.value }
                  })}
                  placeholder="e.g. Hamza Farooq, Zainab Sheikh"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Role / Designation */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Role / Designation
                </label>
                <input
                  type="text"
                  value={agentModal.formData.role}
                  onChange={(e) => setAgentModal({
                    ...agentModal,
                    formData: { ...agentModal.formData, role: e.target.value }
                  })}
                  placeholder="e.g. Senior Sales Rep, Closer, Telecaller"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={agentModal.formData.email}
                    onChange={(e) => setAgentModal({
                      ...agentModal,
                      formData: { ...agentModal.formData, email: e.target.value }
                    })}
                    placeholder="agent@company.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={agentModal.formData.phone}
                    onChange={(e) => setAgentModal({
                      ...agentModal,
                      formData: { ...agentModal.formData, phone: e.target.value }
                    })}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Portal Login PIN */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Portal Login PIN <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={agentModal.formData.pin}
                    onChange={(e) => setAgentModal({
                      ...agentModal,
                      formData: { ...agentModal.formData, pin: e.target.value.replace(/\D/g, '') }
                    })}
                    placeholder="e.g. 5566"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono font-bold tracking-wider focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  The team member will enter this assigned PIN on the login screen to access their leads.
                </p>
              </div>

              {/* Avatar Preset Picker */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Choose Avatar Profile:
                </label>
                <div className="flex items-center gap-2">
                  {[
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80"
                  ].map((imgUrl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAgentModal({
                        ...agentModal,
                        formData: { ...agentModal.formData, avatar: imgUrl }
                      })}
                      className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform hover:scale-110 ${
                        agentModal.formData.avatar === imgUrl ? 'border-blue-600 ring-2 ring-blue-500/30' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={imgUrl} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setAgentModal({ ...agentModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/25 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{agentModal.mode === 'add' ? 'Add Member' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DELETE / REMOVE CONFIRMATION MODAL */}
      {deleteModal.isOpen && deleteModal.agent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center ring-8 ring-rose-50">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Remove "{deleteModal.agent.name}" from Team?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to remove this representative from your sales roster?
                </p>
              </div>

              {deleteModal.agent.totalLeads > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Safe Lead Reallocation:</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <strong>{deleteModal.agent.name}</strong> currently has <strong>{deleteModal.agent.totalLeads} assigned lead(s)</strong>.
                    Removing them will safely return those customers back to the <strong>Unassigned Data Pool</strong> so no customer data is lost!
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, agent: null })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemoveAgent}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Yes, Remove Member</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. QUICK PIN ASSIGNMENT MODAL (ADMIN SETTING) */}
      {pinModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Assign Member PIN</h3>
                  <p className="text-[11px] text-slate-500">Admin Security Settings</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPinModal({ isOpen: false, agent: null, newPin: '' })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="p-6 space-y-4">
              <div className="text-center p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="text-[11px] text-slate-400 uppercase font-semibold">Assigning PIN for</p>
                <p className="text-sm font-bold text-slate-800">{pinModal.agent?.name}</p>
                <p className="text-[11px] text-indigo-600 font-medium">{pinModal.agent?.role}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 text-center">
                  New Security PIN (4 to 6 Digits)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={pinModal.newPin}
                  onChange={(e) => setPinModal({ ...pinModal, newPin: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 5566"
                  className="w-full py-2.5 px-3 text-center font-mono text-xl font-bold tracking-widest bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 text-center">
                  This team member will use this assigned PIN to log in to their personal portal.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModal({ isOpen: false, agent: null, newPin: '' })}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Save & Assign PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
