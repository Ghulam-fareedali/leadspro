import React, { useState, useEffect } from 'react';
import { useLead } from '../context/LeadContext';
import { 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Clock, 
  X, 
  FileText, 
  CheckCircle,
  Building,
  User,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from './Badge';

export const CallModal = ({ lead, isOpen, onClose }) => {
  const { recordCallSimulation } = useLead();
  const [seconds, setSeconds] = useState(0);
  const [isCalling, setIsCalling] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Call Done');
  const [notes, setNotes] = useState('');

  // Call duration counter
  useEffect(() => {
    let interval = null;
    if (isOpen && isCalling) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, isCalling]);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setSeconds(0);
      setIsCalling(true);
      setIsMuted(false);
      setSelectedStatus('Call Done');
      setNotes('');
    }
  }, [isOpen]);

  if (!isOpen || !lead) return null;

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleEndCall = () => {
    setIsCalling(false);
  };

  const handleSaveAndClose = () => {
    recordCallSimulation(lead.id, seconds, notes, selectedStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isCalling ? 'bg-emerald-500/20 text-emerald-400 ring-4 ring-emerald-500/10 animate-pulse' : 'bg-slate-800 text-slate-400'
            }`}>
              {isCalling ? <PhoneCall className="w-6 h-6" /> : <PhoneOff className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                  {isCalling ? 'Active Outbound Call' : 'Call Completed'}
                </span>
                <span className={`w-2 h-2 rounded-full ${isCalling ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">{lead.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>{lead.contactPerson || 'Decision Maker'}</span>
                <span>•</span>
                <span className="font-mono text-emerald-400">{lead.phone}</span>
              </p>
            </div>
          </div>

          {/* Call Live Timer Display */}
          <div className="mt-6 flex items-center justify-between bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-400 font-medium">Call Duration:</span>
            </div>
            <span className="text-xl font-mono font-bold text-emerald-400">
              {formatTimer(seconds)}
            </span>
          </div>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          {/* Audio Controls */}
          {isCalling && (
            <div className="flex items-center justify-center gap-4 py-2 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isMuted ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isMuted ? 'Muted' : 'Mute'}</span>
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 flex items-center gap-2 transition-all"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>
          )}

          {/* Outcome Status Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Call Outcome & Status Update <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Call Done', 'Follow-up', 'Converted', 'Dead'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedStatus(st)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                    selectedStatus === st
                      ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Call Notes & Summary
              </span>
              <span className="text-[10px] text-slate-400">Saved to lead timeline</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Discussed pricing model. Lead wants a revised proposal for 15 users. Follow up next Monday."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Footer action buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
              <span>KPIs will automatically refresh</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAndClose}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm shadow-blue-500/25 transition-all flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Save & Update Lead
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
