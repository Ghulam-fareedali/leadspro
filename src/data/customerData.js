// Active Team Roster (Clean - Ready for Admin to add members and assign security PINs)
export const INITIAL_AGENTS = [];


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

