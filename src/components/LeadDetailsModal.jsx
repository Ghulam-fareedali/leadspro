import React, { useState } from 'react';
import { useLead } from '../context/LeadContext';
import { 
  X, 
  Building, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  PhoneCall, 
  Tag, 
  DollarSign, 
  UserCheck,
  CheckCircle2,
  History
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from './Badge';

export const LeadDetailsModal = ({ lead, isOpen, onClose, onStartCall }) => {
  const { updateLeadNotes, updateLeadStatus, reassignLead, users } = useLead();
  const [editingNotes, setEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState('');

  if (!isOpen || !lead) return null;

  const handleSaveNotes = () => {
    updateLeadNotes(lead.id, noteText);
    setEditingNotes(false);
  };

  const startEditNotes = () => {
    setNoteText(lead.notes || '');
    setEditingNotes(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 font-bold">
                LEAD #{lead.id}
              </span>
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{lead.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Added on {lead.addedDate} • Managed by <strong className="text-slate-700">{lead.assignedTo}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onStartCall(lead);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call Now
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Contact Person
              </span>
              <p className="text-sm font-bold text-slate-800">{lead.contactPerson || lead.name}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Phone Number
              </span>
              <p className="text-sm font-mono font-bold text-blue-600">{lead.phone}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                Email Address
              </span>
              <p className="text-sm font-medium text-slate-700 truncate">{lead.email}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" />
                Deal Value
              </span>
              <p className="text-sm font-bold text-emerald-600">${lead.dealValue?.toLocaleString() || '10,000'}</p>
            </div>
          </div>

          {/* Quick Status / Reassign row */}
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Change Status:</span>
              <select
                value={lead.status}
                onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Pending">Pending (Not Called)</option>
                <option value="Call Done">Call Done</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Converted">Converted</option>
                <option value="Dead">Dead</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700">Assigned Agent:</span>
              <select
                value={lead.assignedTo}
                onChange={(e) => reassignLead(lead.id, e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-blue-500/20"
              >
                {users.filter(u => u.role === 'Agent').map(agent => (
                  <option key={agent.id} value={agent.name}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                <FileText className="w-4 h-4 text-slate-500" />
                Lead Notes & Call Brief
              </span>
              {!editingNotes && (
                <button
                  onClick={startEditNotes}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  Edit Note
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="px-3 py-1 rounded-lg text-slate-500 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 leading-relaxed">
                {lead.notes || 'No notes added yet.'}
              </div>
            )}
          </div>

          {/* Call History Timeline */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <History className="w-4 h-4 text-slate-500" />
              Call Activity History ({lead.callHistory?.length || 0})
            </h4>

            {(!lead.callHistory || lead.callHistory.length === 0) ? (
              <div className="p-4 text-center rounded-xl border border-dashed border-slate-200 text-slate-400">
                No outbound calls recorded for this lead yet.
              </div>
            ) : (
              <div className="space-y-2">
                {lead.callHistory.map((call, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{call.outcome}</p>
                        <p className="text-[11px] text-slate-400">
                          {call.date} • Agent: <span className="text-slate-600 font-medium">{call.agent}</span>
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      {call.duration}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
