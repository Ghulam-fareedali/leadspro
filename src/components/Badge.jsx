import React from 'react';
import { STATUS_CONFIG } from '../data/mockData';
import { Clock, PhoneCall, Calendar, CheckCircle2, XCircle } from 'lucide-react';

const ICONS = {
  Pending: Clock,
  'Call Done': PhoneCall,
  'Follow-up': Calendar,
  Converted: CheckCircle2,
  Dead: XCircle,
};

export const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const IconComponent = ICONS[status] || Clock;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  };

  const iconSizes = {
    sm: 12,
    md: 13,
    lg: 15,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ring-1 ${config.badgeClass} ${sizeClasses[size]} transition-all`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      <IconComponent size={iconSizes[size]} className="opacity-80" />
      <span>{config.label}</span>
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const styles = {
    High: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    Low: 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/10',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ring-1 ${styles[priority] || styles.Low}`}
    >
      {priority}
    </span>
  );
};
