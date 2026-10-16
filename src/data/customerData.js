export const INITIAL_AGENTS = [
  {
    id: 1,
    name: "Bilal Ahmed",
    email: "bilal.ahmed@omniflow.io",
    role: "Senior Sales Rep",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    color: "blue",
    pin: "1234"
  },
  {
    id: 2,
    name: "Sara Malik",
    email: "sara.malik@omniflow.io",
    role: "Outbound Specialist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    color: "purple",
    pin: "2345"
  },
  {
    id: 3,
    name: "Ali Khan",
    email: "ali.khan@omniflow.io",
    role: "Lead Dispatcher / Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    color: "emerald",
    pin: "9999"
  },
  {
    id: 4,
    name: "Usman Ghani",
    email: "usman.ghani@omniflow.io",
    role: "Enterprise Closer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    color: "amber",
    pin: "3456"
  }
];

export const LEAD_STATUS_CONFIG = {
  Pending: {
    label: "Pending",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
    dotClass: "bg-amber-400",
    barColor: "bg-amber-400",
    textColor: "text-amber-700",
    bgLight: "bg-amber-50",
    borderClass: "border-amber-200",
    description: "Default state when assigned. Awaiting initial agent outreach."
  },
  Connected: {
    label: "Connected",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
    dotClass: "bg-blue-500",
    barColor: "bg-blue-500",
    textColor: "text-blue-700",
    bgLight: "bg-blue-50",
    borderClass: "border-blue-200",
    description: "Agent has made contact; discussion ongoing, no final decision yet."
  },
  Interested: {
    label: "Interested",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
    dotClass: "bg-emerald-500",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgLight: "bg-emerald-50",
    borderClass: "border-emerald-200",
    description: "Hot lead; high purchase intent, ready for proposal/closing."
  },
  "Not Interested": {
    label: "Not Interested",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10",
    dotClass: "bg-rose-500",
    barColor: "bg-rose-500",
    textColor: "text-rose-700",
    bgLight: "bg-rose-50",
    borderClass: "border-rose-200",
    description: "Dead lead; declined offer or disqualified."
  }
};

// Raw Customers Pool (Clean - Ready for live ingestion / Excel uploads)
export const INITIAL_CUSTOMERS = [];

// Assigned Leads Pipeline (Clean - Ready for agent allocation)
export const INITIAL_LEADS = [];

// Presets for upload simulation
export const BULK_UPLOAD_PRESETS = [];

