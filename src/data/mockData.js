export const INITIAL_USERS = [];


export const STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
    dotClass: "bg-amber-400",
    borderLeftClass: "border-l-amber-400",
    description: "Call not yet initiated"
  },
  "Call Done": {
    label: "Call Done",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
    dotClass: "bg-blue-500",
    borderLeftClass: "border-l-blue-500",
    description: "Initial contact established"
  },
  "Follow-up": {
    label: "Follow-up",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10",
    dotClass: "bg-purple-500",
    borderLeftClass: "border-l-purple-500",
    description: "Scheduled for second discussion"
  },
  Converted: {
    label: "Converted",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
    dotClass: "bg-emerald-500",
    borderLeftClass: "border-l-emerald-500",
    description: "Contract signed / Deal won"
  },
  Dead: {
    label: "Dead",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10",
    dotClass: "bg-rose-500",
    borderLeftClass: "border-l-rose-500",
    description: "Unqualified or declined"
  }
};

export const INITIAL_LEADS = [];

export const INITIAL_ACTIVITIES = [];
