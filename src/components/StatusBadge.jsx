import React from 'react';
import { LEAD_STATUS_CONFIG } from '../data/customerData';
import { Clock, PhoneCall, CheckCircle2, XCircle, UserCheck, Inbox, PhoneOff } from 'lucide-react';

const STATUS_ICONS = {
  Pending: Clock,
  Connected: PhoneCall,
  Interested: CheckCircle2,
  'Not Interested': XCircle,
  'Not on WhatsApp': PhoneOff,
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = LEAD_STATUS_CONFIG[status] || LEAD_STATUS_CONFIG.Pending;
  const Icon = STATUS_ICONS[status] || Clock;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-sm font-bold',
  };

  const iconSizes = {
    sm: 12,
    md: 13,
    lg: 15,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ${config.badgeClass} ${sizeClasses[size]} transition-all select-none`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <Icon size={iconSizes[size]} className="opacity-90 shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};

export const AssignmentBadge = ({ isAssigned, assignedTo }) => {
  if (isAssigned) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 ring-1 ring-emerald-500/10">
        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Assigned to <strong className="text-emerald-900">{assignedTo}</strong></span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 ring-1 ring-slate-400/10">
      <Inbox className="w-3.5 h-3.5 text-slate-400" />
      <span>Unassigned (Pool)</span>
    </span>
  );
};

export const SourceBadge = ({ source }) => {
  const styles = {
    'Website Inbound': 'bg-blue-50 text-blue-700 border-blue-200',
    'Excel Bulk Import': 'bg-purple-50 text-purple-700 border-purple-200',
    'LinkedIn Ad': 'bg-sky-50 text-sky-700 border-sky-200',
    'Trade Expo 2026': 'bg-amber-50 text-amber-700 border-amber-200',
    'Facebook Campaign': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Referral': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Direct Entry': 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${styles[source] || styles['Direct Entry']}`}>
      {source}
    </span>
  );
};
