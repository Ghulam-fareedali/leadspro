export const INITIAL_AGENTS = [
  {
    id: 1,
    name: "Bilal Ahmed",
    email: "bilal.ahmed@omniflow.io",
    role: "Senior Sales Rep",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    color: "blue"
  },
  {
    id: 2,
    name: "Sara Malik",
    email: "sara.malik@omniflow.io",
    role: "Outbound Specialist",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    color: "purple"
  },
  {
    id: 3,
    name: "Ali Khan",
    email: "ali.khan@omniflow.io",
    role: "Lead Dispatcher / Admin",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    color: "emerald"
  },
  {
    id: 4,
    name: "Usman Ghani",
    email: "usman.ghani@omniflow.io",
    role: "Enterprise Closer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    color: "amber"
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

// Initial Raw Customers Pool
export const INITIAL_CUSTOMERS = [
  {
    id: "CUST-1001",
    name: "Tech Solutions Inc.",
    phone: "0300-1234567",
    email: "contact@techsolutions.pk",
    source: "Website Inbound",
    city: "Karachi",
    importedDate: "2026-10-16",
    isAssigned: true,
    assignedTo: "Bilal Ahmed",
    assignedAt: "2026-10-16 09:30"
  },
  {
    id: "CUST-1002",
    name: "Nexus Retailers",
    phone: "0321-9876543",
    email: "ayesha@nexusretail.com",
    source: "Excel Bulk Import",
    city: "Lahore",
    importedDate: "2026-10-16",
    isAssigned: true,
    assignedTo: "Sara Malik",
    assignedAt: "2026-10-16 10:15"
  },
  {
    id: "CUST-1003",
    name: "Apex Logistics Ltd.",
    phone: "0333-5551234",
    email: "h.farooq@apexlogistics.org",
    source: "LinkedIn Ad",
    city: "Islamabad",
    importedDate: "2026-10-15",
    isAssigned: true,
    assignedTo: "Bilal Ahmed",
    assignedAt: "2026-10-15 14:00"
  },
  {
    id: "CUST-1004",
    name: "Crescent Health & Pharma",
    phone: "0312-4447890",
    email: "nadia@crescenthealth.com",
    source: "Trade Expo 2026",
    city: "Faisalabad",
    importedDate: "2026-10-15",
    isAssigned: true,
    assignedTo: "Sara Malik",
    assignedAt: "2026-10-15 16:30"
  },
  {
    id: "CUST-1005",
    name: "Urban Outfitters Hub",
    phone: "0345-6789012",
    email: "zubair@urbanhub.store",
    source: "Facebook Campaign",
    city: "Lahore",
    importedDate: "2026-10-14",
    isAssigned: true,
    assignedTo: "Usman Ghani",
    assignedAt: "2026-10-15 11:20"
  },
  {
    id: "CUST-1006",
    name: "Prime Cloud Systems",
    phone: "0301-8889911",
    email: "omar@primecloud.io",
    source: "Website Inbound",
    city: "Islamabad",
    importedDate: "2026-10-16",
    isAssigned: true,
    assignedTo: "Bilal Ahmed",
    assignedAt: "2026-10-16 11:45"
  },
  // UNASSIGNED RAW CUSTOMERS READY FOR DISTRIBUTION IN DEMO:
  {
    id: "CUST-1007",
    name: "Falcon Freight Network",
    phone: "0322-1112233",
    email: "usman@falconlog.com",
    source: "Excel Bulk Import",
    city: "Rawalpindi",
    importedDate: "2026-10-16",
    isAssigned: false,
    assignedTo: null,
    assignedAt: null
  },
  {
    id: "CUST-1008",
    name: "Beaconhouse Edutech",
    phone: "0331-9988776",
    email: "maryam@beaconedutech.pk",
    source: "Referral",
    city: "Lahore",
    importedDate: "2026-10-16",
    isAssigned: false,
    assignedTo: null,
    assignedAt: null
  },
  {
    id: "CUST-1009",
    name: "Zenith Financial Advisory",
    phone: "0305-7766554",
    email: "a.mansoor@zenithfin.com",
    source: "LinkedIn Ad",
    city: "Karachi",
    importedDate: "2026-10-16",
    isAssigned: false,
    assignedTo: null,
    assignedAt: null
  },
  {
    id: "CUST-1010",
    name: "Silverline Properties",
    phone: "0315-3344556",
    email: "info@silverlineproperties.com",
    source: "Facebook Campaign",
    city: "Islamabad",
    importedDate: "2026-10-16",
    isAssigned: false,
    assignedTo: null,
    assignedAt: null
  },
  {
    id: "CUST-1011",
    name: "Green Agri Innovations",
    phone: "0342-8877665",
    email: "shahid@greenagri.pk",
    source: "Trade Expo 2026",
    city: "Multan",
    importedDate: "2026-10-16",
    isAssigned: false,
    assignedTo: null,
    assignedAt: null
  },
  {
    id: "CUST-1012",
    name: "Vortex Gaming Labs",
    phone: "0308-2233445",
    email: "danyal@vortexgaming.io",
    source: "Website Inbound",
    city: "Lahore",
    importedDate: "2026-10-16",
    isAssigned: false,
    assignedTo: null,
    assignedAt: null
  },
  {
    id: "CUST-1013",
    name: "Horizon Apparel Mills",
    phone: "0323-5566778",
    email: "tariq@horizonmills.com",
    source: "Excel Bulk Import",
    city: "Faisalabad",
    importedDate: "2026-10-16",
    isAssigned: false,
    assignedTo: null,
    assignedAt: null
  },
  {
    id: "CUST-1014",
    name: "Metropolis Dental Clinic",
    phone: "0335-1237890",
    email: "appointments@metropolisdental.pk",
    source: "Referral",
    city: "Karachi",
    importedDate: "2026-10-16",
    isAssigned: false,
    assignedTo: null,
    assignedAt: null
  }
];

// Initial Assigned Leads Pipeline (Directly mapped from assigned customers)
export const INITIAL_LEADS = [
  {
    id: "LEAD-2001",
    customerId: "CUST-1001",
    name: "Tech Solutions Inc.",
    phone: "0300-1234567",
    email: "contact@techsolutions.pk",
    source: "Website Inbound",
    assignedAgent: "Bilal Ahmed",
    status: "Pending", // Default state when assigned
    notes: "Recently assigned. Needs introductory discovery call.",
    assignedDate: "2026-10-16",
    lastContactDate: null
  },
  {
    id: "LEAD-2002",
    customerId: "CUST-1002",
    name: "Nexus Retailers",
    phone: "0321-9876543",
    email: "ayesha@nexusretail.com",
    source: "Excel Bulk Import",
    assignedAgent: "Sara Malik",
    status: "Connected", // Agent made contact
    notes: "Spoke with Ms. Ayesha. She requested product brochure and pricing tier.",
    assignedDate: "2026-10-16",
    lastContactDate: "2026-10-16 11:20"
  },
  {
    id: "LEAD-2003",
    customerId: "CUST-1003",
    name: "Apex Logistics Ltd.",
    phone: "0333-5551234",
    email: "h.farooq@apexlogistics.org",
    source: "LinkedIn Ad",
    assignedAgent: "Bilal Ahmed",
    status: "Interested", // Hot lead, ready to convert
    notes: "High intent! Requested formal enterprise quote for 25 user licenses.",
    assignedDate: "2026-10-15",
    lastContactDate: "2026-10-16 10:05"
  },
  {
    id: "LEAD-2004",
    customerId: "CUST-1004",
    name: "Crescent Health & Pharma",
    phone: "0312-4447890",
    email: "nadia@crescenthealth.com",
    source: "Trade Expo 2026",
    assignedAgent: "Sara Malik",
    status: "Interested", // Hot lead, ready to convert
    notes: "Dr. Nadia confirmed budget approval. Scheduling contract signature.",
    assignedDate: "2026-10-15",
    lastContactDate: "2026-10-16 09:15"
  },
  {
    id: "LEAD-2005",
    customerId: "CUST-1005",
    name: "Urban Outfitters Hub",
    phone: "0345-6789012",
    email: "zubair@urbanhub.store",
    source: "Facebook Campaign",
    assignedAgent: "Usman Ghani",
    status: "Not Interested", // Dead lead
    notes: "Contact person indicated they renewed with their existing vendor for 2 years.",
    assignedDate: "2026-10-15",
    lastContactDate: "2026-10-15 15:40"
  },
  {
    id: "LEAD-2006",
    customerId: "CUST-1006",
    name: "Prime Cloud Systems",
    phone: "0301-8889911",
    email: "omar@primecloud.io",
    source: "Website Inbound",
    assignedAgent: "Bilal Ahmed",
    status: "Pending", // Default state
    notes: "Inbound request from cloud infrastructure team.",
    assignedDate: "2026-10-16",
    lastContactDate: null
  }
];

// Presets for the Excel/CSV Upload Simulation
export const BULK_UPLOAD_PRESETS = [
  {
    name: "Oct_Q4_Corporate_Leads_Batch_A.xlsx",
    count: 6,
    records: [
      {
        name: "Omni Logistics Hub",
        phone: "0302-3344556",
        email: "dispatch@omnilogistics.pk",
        source: "Excel Bulk Import",
        city: "Karachi"
      },
      {
        name: "BlueSky Solar Energy",
        phone: "0324-7788990",
        email: "sales@blueskysolar.com",
        source: "Excel Bulk Import",
        city: "Lahore"
      },
      {
        name: "SilkRoute Express Couriers",
        phone: "0336-1122334",
        email: "fleet@silkroute.pk",
        source: "Excel Bulk Import",
        city: "Islamabad"
      },
      {
        name: "Al-Noor Textile Mills",
        phone: "0314-8899001",
        email: "info@alnoortextiles.com",
        source: "Excel Bulk Import",
        city: "Faisalabad"
      },
      {
        name: "Nova Bio-Medical Supplies",
        phone: "0346-5566778",
        email: "orders@novabiomed.pk",
        source: "Excel Bulk Import",
        city: "Peshawar"
      },
      {
        name: "Sapphire FinTech Labs",
        phone: "0307-2233441",
        email: "founders@sapphirefin.io",
        source: "Excel Bulk Import",
        city: "Karachi"
      }
    ]
  }
];
