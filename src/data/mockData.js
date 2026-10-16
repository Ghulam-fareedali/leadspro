export const INITIAL_USERS = [
  { 
    id: 1, 
    name: "Ali", 
    role: "Admin", 
    email: "ali.khan@leadflow.io", 
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "Head of Sales"
  },
  { 
    id: 2, 
    name: "Bilal", 
    role: "Agent", 
    email: "bilal.ahmed@leadflow.io", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    title: "Senior Sales Representative"
  },
  { 
    id: 3, 
    name: "Sara", 
    role: "Agent", 
    email: "sara.malik@leadflow.io", 
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    title: "Outbound Call Specialist"
  }
];

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

export const INITIAL_LEADS = [
  {
    id: 101,
    name: "Tech Solutions Inc.",
    contactPerson: "Kamran Raza",
    phone: "0300-1234567",
    email: "contact@techsolutions.pk",
    assignedTo: "Bilal",
    status: "Pending",
    priority: "High",
    dealValue: 12500,
    addedDate: "2026-10-16",
    notes: "Interested in enterprise CRM migration. Requested 20-seat quote.",
    callHistory: []
  },
  {
    id: 102,
    name: "Nexus Retailers",
    contactPerson: "Ayesha Tariq",
    phone: "0321-9876543",
    email: "ayesha@nexusretail.com",
    assignedTo: "Sara",
    status: "Call Done",
    priority: "Medium",
    dealValue: 8400,
    addedDate: "2026-10-15",
    notes: "Call completed. Agent discussed cloud POS system. Sent feature sheet.",
    callHistory: [
      { date: "2026-10-15 14:30", agent: "Sara", duration: "4m 12s", outcome: "Sent Product Deck" }
    ]
  },
  {
    id: 103,
    name: "Apex Logistics",
    contactPerson: "Hamza Farooq",
    phone: "0333-5551234",
    email: "h.farooq@apexlogistics.org",
    assignedTo: "Bilal",
    status: "Follow-up",
    priority: "High",
    dealValue: 24000,
    addedDate: "2026-10-14",
    notes: "Follow-up call booked for Oct 18 with CTO regarding fleet tracking API.",
    callHistory: [
      { date: "2026-10-14 11:15", agent: "Bilal", duration: "6m 45s", outcome: "CTO Meeting Scheduled" }
    ]
  },
  {
    id: 104,
    name: "Crescent Health & Pharma",
    contactPerson: "Dr. Nadia Bashir",
    phone: "0312-4447890",
    email: "nadia@crescenthealth.com",
    assignedTo: "Sara",
    status: "Converted",
    priority: "High",
    dealValue: 35000,
    addedDate: "2026-10-12",
    notes: "Signed 1-year annual agreement for enterprise call routing suite.",
    callHistory: [
      { date: "2026-10-13 16:00", agent: "Sara", duration: "12m 30s", outcome: "Contract Finalized" }
    ]
  },
  {
    id: 105,
    name: "Urban Outfitters Hub",
    contactPerson: "Zubair Hashmi",
    phone: "0345-6789012",
    email: "zubair@urbanhub.store",
    assignedTo: "Bilal",
    status: "Dead",
    priority: "Low",
    dealValue: 3200,
    addedDate: "2026-10-11",
    notes: "Budget mismatch. They decided to remain on free tier spreadsheet tools.",
    callHistory: [
      { date: "2026-10-12 10:20", agent: "Bilal", duration: "2m 10s", outcome: "Budget constraint" }
    ]
  },
  {
    id: 106,
    name: "Prime Cloud Systems",
    contactPerson: "Omar Farooq",
    phone: "0301-8889911",
    email: "omar@primecloud.io",
    assignedTo: "Sara",
    status: "Pending",
    priority: "High",
    dealValue: 18000,
    addedDate: "2026-10-16",
    notes: "Inbound demo request via website form. High purchase intent.",
    callHistory: []
  },
  {
    id: 107,
    name: "Falcon Freight Network",
    contactPerson: "Usman Ghani",
    phone: "0322-1112233",
    email: "usman@falconlog.com",
    assignedTo: "Bilal",
    status: "Pending",
    priority: "Medium",
    dealValue: 9500,
    addedDate: "2026-10-16",
    notes: "Needs SMS gateway integration. Follow up on tech compatibility.",
    callHistory: []
  },
  {
    id: 108,
    name: "Beaconhouse Edutech",
    contactPerson: "Maryam Jamil",
    phone: "0331-9988776",
    email: "maryam@beaconedutech.pk",
    assignedTo: "Sara",
    status: "Follow-up",
    priority: "Medium",
    dealValue: 15200,
    addedDate: "2026-10-13",
    notes: "Requested trial extension until upcoming Monday board meeting.",
    callHistory: [
      { date: "2026-10-14 15:45", agent: "Sara", duration: "5m 18s", outcome: "Trial extended" }
    ]
  },
  {
    id: 109,
    name: "Zenith Financials",
    contactPerson: "Asad Mansoor",
    phone: "0305-7766554",
    email: "a.mansoor@zenithfin.com",
    assignedTo: "Bilal",
    status: "Converted",
    priority: "High",
    dealValue: 42000,
    addedDate: "2026-10-10",
    notes: "Security compliance verified. Enterprise pilot converted successfully.",
    callHistory: [
      { date: "2026-10-11 11:30", agent: "Bilal", duration: "18m 05s", outcome: "Enterprise Deal Closed" }
    ]
  },
  {
    id: 110,
    name: "Silverline Properties",
    contactPerson: "Faisal Siddiqui",
    phone: "0315-3344556",
    email: "info@silverlineproperties.com",
    assignedTo: "Sara",
    status: "Call Done",
    priority: "Low",
    dealValue: 6000,
    addedDate: "2026-10-15",
    notes: "Spoke with receptionist; transferred to head broker. Catalog forwarded.",
    callHistory: [
      { date: "2026-10-15 16:10", agent: "Sara", duration: "3m 40s", outcome: "Catalog Sent" }
    ]
  },
  {
    id: 111,
    name: "Green Agri Innovations",
    contactPerson: "Shahid Iqbal",
    phone: "0342-8877665",
    email: "shahid@greenagri.pk",
    assignedTo: "Bilal",
    status: "Pending",
    priority: "Medium",
    dealValue: 11000,
    addedDate: "2026-10-16",
    notes: "Irrigation IoT startup looking for outbound telemarketing support.",
    callHistory: []
  },
  {
    id: 112,
    name: "Vortex Gaming Labs",
    contactPerson: "Danyal Mirza",
    phone: "0308-2233445",
    email: "danyal@vortexgaming.io",
    assignedTo: "Sara",
    status: "Dead",
    priority: "Low",
    dealValue: 4500,
    addedDate: "2026-10-09",
    notes: "Number disconnected / wrong email address provided.",
    callHistory: [
      { date: "2026-10-10 09:30", agent: "Sara", duration: "0m 45s", outcome: "Invalid Contact" }
    ]
  },
  {
    id: 113,
    name: "Horizon Apparel Mills",
    contactPerson: "Tariq Mahmood",
    phone: "0323-5566778",
    email: "tariq@horizonmills.com",
    assignedTo: "Bilal",
    status: "Call Done",
    priority: "High",
    dealValue: 19500,
    addedDate: "2026-10-14",
    notes: "Completed deep dive demo. Procurement team reviewing vendor terms.",
    callHistory: [
      { date: "2026-10-15 13:00", agent: "Bilal", duration: "14m 20s", outcome: "Demo Completed" }
    ]
  },
  {
    id: 114,
    name: "Metropolis Dental Clinic",
    contactPerson: "Dr. Sana Akram",
    phone: "0335-1237890",
    email: "appointments@metropolisdental.pk",
    assignedTo: "Sara",
    status: "Pending",
    priority: "Medium",
    dealValue: 7800,
    addedDate: "2026-10-16",
    notes: "Multi-branch clinic looking to streamline patient reminder calls.",
    callHistory: []
  }
];

export const INITIAL_ACTIVITIES = [
  {
    id: 1,
    user: "Bilal",
    action: "marked lead as Call Done",
    target: "Horizon Apparel Mills",
    time: "10 mins ago",
    type: "status_change",
    status: "Call Done"
  },
  {
    id: 2,
    user: "Sara",
    action: "scheduled follow-up call with",
    target: "Beaconhouse Edutech",
    time: "42 mins ago",
    type: "schedule",
    status: "Follow-up"
  },
  {
    id: 3,
    user: "Ali",
    action: "assigned new lead to",
    target: "Tech Solutions Inc. → Bilal",
    time: "2 hours ago",
    type: "lead_assigned"
  },
  {
    id: 4,
    user: "Sara",
    action: "closed deal with",
    target: "Crescent Health & Pharma",
    time: "Yesterday",
    type: "conversion",
    status: "Converted"
  }
];
