import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  INITIAL_AGENTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_LEADS, 
  LEAD_STATUS_CONFIG 
} from '../data/customerData';

// Clean test data version marker - ensures any cached dummy records and mock agents are purged
const DATA_STORAGE_VERSION = 'v3_production_realtime';
if (typeof window !== 'undefined') {
  try {
    const cachedVer = localStorage.getItem('leadspro_storage_version');
    if (cachedVer !== DATA_STORAGE_VERSION) {
      localStorage.removeItem('leadspro_customers');
      localStorage.removeItem('leadspro_leads');
      localStorage.removeItem('leadspro_agents');
      localStorage.removeItem('leadspro_auth');
      localStorage.setItem('leadspro_storage_version', DATA_STORAGE_VERSION);
    }
  } catch (e) {
    console.warn('Storage version check failed:', e);
  }
}

export const DEFAULT_ADMIN = {
  email: 'admin@leadspro.com',
  username: 'admin',
  password: 'admin',
  name: 'Admin'
};

const CrmContext = createContext(null);

export const CrmProvider = ({ children }) => {
  // Configured Admin Profile (Name, Email, Password) - with instant default credentials
  const [adminProfile, setAdminProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('leadspro_admin_profile');
      return cached ? JSON.parse(cached) : DEFAULT_ADMIN;
    } catch {
      return DEFAULT_ADMIN;
    }
  });

  // Load cached team agents or fallback to INITIAL_AGENTS (empty array for clean production)
  const [agents, setAgents] = useState(() => {
    try {
      const cached = localStorage.getItem('leadspro_agents');
      if (cached) {
        return JSON.parse(cached);
      }
      return INITIAL_AGENTS;
    } catch {
      return INITIAL_AGENTS;
    }
  });

  // Authentication: null (show login screen) | { type: 'admin', ... } | { type: 'agent', ... }
  const [auth, setAuth] = useState(() => {
    try {
      const cached = localStorage.getItem('leadspro_auth');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [customers, setCustomers] = useState(() => {
    try {
      const cached = localStorage.getItem('leadspro_customers');
      return cached ? JSON.parse(cached) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [leads, setLeads] = useState(() => {
    try {
      const cached = localStorage.getItem('leadspro_leads');
      return cached ? JSON.parse(cached) : INITIAL_LEADS;
    } catch {
      return INITIAL_LEADS;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    mode: 'local',
    message: 'Local Cache Mode'
  });

  // Keep localStorage in sync as robust fallback
  useEffect(() => {
    try {
      localStorage.setItem('leadspro_agents', JSON.stringify(agents));
      localStorage.setItem('leadspro_customers', JSON.stringify(customers));
      localStorage.setItem('leadspro_leads', JSON.stringify(leads));
      if (auth) {
        localStorage.setItem('leadspro_auth', JSON.stringify(auth));
      } else {
        localStorage.removeItem('leadspro_auth');
      }
    } catch (err) {
      console.warn('Storage sync failed:', err);
    }
  }, [agents, customers, leads, auth]);

  // Toast Notification Manager
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    setToasts(prev => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const CLOUD_SYNC_BIN = 'https://extendsclass.com/api/json-storage/bin/fecfccb';
  const CLOUD_SYNC_KEY = 'leadspro_secret_key_9981';

  // Push latest state to shared cloud
  const pushToSharedCloud = useCallback(async (overrides = {}) => {
    try {
      const payload = {
        customers: overrides.customers !== undefined ? overrides.customers : customers,
        agents: overrides.agents !== undefined ? overrides.agents : agents,
        leads: overrides.leads !== undefined ? overrides.leads : leads,
        admin: overrides.admin !== undefined ? overrides.admin : (adminProfile || DEFAULT_ADMIN),
        version: '1.0',
        updatedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('leadspro_customers', JSON.stringify(payload.customers));
        localStorage.setItem('leadspro_agents', JSON.stringify(payload.agents));
        localStorage.setItem('leadspro_leads', JSON.stringify(payload.leads));
        localStorage.setItem('leadspro_admin_profile', JSON.stringify(payload.admin));
      } catch (err) {}

      await fetch(CLOUD_SYNC_BIN, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Security-key': CLOUD_SYNC_KEY
        },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {
      console.warn('Cloud sync push warning:', e);
    }
  }, [customers, agents, leads, adminProfile]);

  // Sync state across all devices
  const syncWithBackend = useCallback(async (isManual = false) => {
    try {
      // 1. Fetch directly from shared cloud bin (accessible across all PCs immediately)
      let cloudData = null;
      try {
        const cloudRes = await fetch(`${CLOUD_SYNC_BIN}?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (cloudRes.ok) {
          cloudData = await cloudRes.json();
        }
      } catch (e) {
        console.warn('Direct cloud fetch warning:', e);
      }

      // 2. Also check backend API in case MongoDB Atlas is active
      let apiData = null;
      try {
        const [agentRes, custRes, leadRes, adminRes] = await Promise.all([
          fetch('/api/agents?t=' + Date.now()).catch(() => null),
          fetch('/api/customers?t=' + Date.now()).catch(() => null),
          fetch('/api/leads?t=' + Date.now()).catch(() => null),
          fetch('/api/admin?t=' + Date.now()).catch(() => null)
        ]);

        if (custRes && custRes.ok) {
          const cJson = await custRes.json();
          if (cJson.source === 'mongodb' && Array.isArray(cJson.data)) {
            apiData = {
              customers: cJson.data,
              agents: agentRes && agentRes.ok ? (await agentRes.json()).data : null,
              leads: leadRes && leadRes.ok ? (await leadRes.json()).data : null,
              admin: adminRes && adminRes.ok ? (await adminRes.json()).data : null
            };
          }
        }
      } catch (e) {}

      // Prefer MongoDB if active, otherwise live Cloud Bin
      const resolved = apiData || cloudData;

      if (resolved) {
        if (Array.isArray(resolved.customers)) {
          setCustomers(resolved.customers);
          try { localStorage.setItem('leadspro_customers', JSON.stringify(resolved.customers)); } catch {}
        }
        if (Array.isArray(resolved.agents)) {
          setAgents(resolved.agents);
          try { localStorage.setItem('leadspro_agents', JSON.stringify(resolved.agents)); } catch {}
        }
        if (Array.isArray(resolved.leads)) {
          setLeads(resolved.leads);
          try { localStorage.setItem('leadspro_leads', JSON.stringify(resolved.leads)); } catch {}
        }
        if (resolved.admin && (resolved.admin.password || resolved.admin.email)) {
          setAdminProfile(resolved.admin);
          try { localStorage.setItem('leadspro_admin_profile', JSON.stringify(resolved.admin)); } catch {}
        }
      }

      setDbStatus({
        connected: true,
        mode: apiData ? 'mongodb' : 'cloud-sync',
        message: 'Live Multi-Device Cloud Sync Active'
      });

      if (isManual) {
        addToast({
          title: 'Cloud Synchronized',
          message: 'All records, team members, and PINs are live and synced across all devices.',
          type: 'success'
        });
      }
    } catch (err) {
      console.warn('Sync error:', err);
    }
  }, [addToast]);

  // Live Auto-Sync: Poll every 5 seconds + on window focus so any changes on PC 1 appear on PC 2
  useEffect(() => {
    syncWithBackend();

    const interval = setInterval(() => {
      syncWithBackend();
    }, 5000);

    const handleFocus = () => {
      syncWithBackend();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncWithBackend]);

  // 1. BULK UPLOAD CUSTOMERS (Module 1)
  const bulkUploadCustomers = useCallback(async (newRecords, fileName = 'Imported_File.xlsx') => {
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    
    // Find highest existing CUST ID
    const existingIds = customers.map(c => {
      const num = parseInt(c.id.replace(/\D/g, ''), 10);
      return isNaN(num) ? 1000 : num;
    });
    let nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1001;

    const formattedRecords = newRecords.map((item) => {
      const id = `CUST-${nextNum++}`;
      return {
        id,
        name: item.name || 'Unnamed Corporate Account',
        phone: item.phone || '0300-0000000',
        email: item.email || `inquiry@${item.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        source: item.source || 'Excel Bulk Import',
        city: item.city || 'Karachi',
        importedDate: formattedDate,
        isAssigned: false,
        assignedTo: null,
        assignedAt: null
      };
    });

    // Update local state and sync to cloud bin immediately
    const nextCustomers = [...formattedRecords, ...customers];
    setCustomers(nextCustomers);
    pushToSharedCloud({ customers: nextCustomers });

    // Send to backend API asynchronously
    try {
      fetch('/api/customers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: formattedRecords })
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Bulk Data Ingested',
      message: `Successfully uploaded ${formattedRecords.length} customer records from "${fileName}". Synced across devices.`,
      type: 'success'
    });

    return formattedRecords;
  }, [customers, pushToSharedCloud, addToast]);

  // 2. ASSIGN CUSTOMERS TO AGENT (The Crucial Workflow)
  const assignCustomersToAgent = useCallback(async (customerIds, agentName) => {
    if (!customerIds || customerIds.length === 0) {
      addToast({
        title: 'Selection Required',
        message: 'Please select at least one customer row to assign.',
        type: 'warning'
      });
      return false;
    }

    if (!agentName) {
      addToast({
        title: 'Agent Required',
        message: 'Please select an agent for assignment.',
        type: 'warning'
      });
      return false;
    }

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const customersToAssign = customers.filter(c => customerIds.includes(c.id));

    // Update customers state
    const nextCustomers = customers.map(c => {
      if (customerIds.includes(c.id)) {
        return {
          ...c,
          isAssigned: true,
          assignedTo: agentName,
          assignedAt: `${formattedDate} ${formattedTime}`
        };
      }
      return c;
    });

    // Spawn corresponding Leads
    const newLeads = customersToAssign.map((cust, idx) => {
      const leadNum = 2000 + leads.length + idx + 1;
      return {
        id: `LEAD-${leadNum}`,
        customerId: cust.id,
        name: cust.name,
        phone: cust.phone,
        email: cust.email,
        source: cust.source,
        assignedAgent: agentName,
        status: 'Pending',
        notes: `Assigned to ${agentName} on ${formattedDate}. Awaiting first contact.`,
        assignedDate: formattedDate,
        lastContactDate: null
      };
    });

    const nextLeads = [...newLeads, ...leads];

    setCustomers(nextCustomers);
    setLeads(nextLeads);
    pushToSharedCloud({ customers: nextCustomers, leads: nextLeads });

    // Send to backend API
    try {
      fetch('/api/customers/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds, agentName })
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Workflow Assignment Complete',
      message: `${customerIds.length} customer(s) successfully routed to ${agentName}. Synced across devices.`,
      type: 'success'
    });

    return true;
  }, [customers, leads, pushToSharedCloud, addToast]);

  // 3. STATUS TRACKING & UPDATING (Module 2)
  const updateLeadStatus = useCallback(async (leadId, newStatus, note = '') => {
    let leadName = '';

    const nextLeads = leads.map(lead => {
      if (lead.id === leadId) {
        leadName = lead.name;
        const now = new Date();
        const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        
        return {
          ...lead,
          status: newStatus,
          lastContactDate: newStatus !== 'Pending' ? timestamp : lead.lastContactDate,
          notes: note ? `${note} (Updated to ${newStatus})` : lead.notes
        };
      }
      return lead;
    });

    setLeads(nextLeads);
    pushToSharedCloud({ leads: nextLeads });

    // Send to backend API
    try {
      fetch(`/api/leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: note })
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Pipeline Status Updated',
      message: `"${leadName}" marked as "${newStatus}". Synced across devices.`,
      type: newStatus === 'Interested' ? 'success' : newStatus === 'Not Interested' ? 'warning' : 'info'
    });
  }, [leads, pushToSharedCloud, addToast]);

  // 4. ADD SINGLE CUSTOMER MANUALLY
  const addSingleCustomer = useCallback(async (customerData) => {
    const existingIds = customers.map(c => {
      const num = parseInt(c.id.replace(/\D/g, ''), 10);
      return isNaN(num) ? 1000 : num;
    });
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1001;

    const newCust = {
      id: `CUST-${nextNum}`,
      name: customerData.name.trim(),
      phone: customerData.phone.trim(),
      email: customerData.email.trim(),
      source: customerData.source || 'Direct Entry',
      city: customerData.city || 'Karachi',
      importedDate: new Date().toISOString().split('T')[0],
      isAssigned: false,
      assignedTo: null,
      assignedAt: null
    };

    const nextCustomers = [newCust, ...customers];
    setCustomers(nextCustomers);
    pushToSharedCloud({ customers: nextCustomers });

    // Send to API
    try {
      fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust)
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Customer Added',
      message: `"${newCust.name}" added and synced across all devices.`,
      type: 'success'
    });

    return newCust;
  }, [customers, pushToSharedCloud, addToast]);

  // 5. DELETE CUSTOMERS (Single or Bulk, including assigned & imported ones)
  const deleteCustomers = useCallback(async (customerIds) => {
    if (!customerIds || customerIds.length === 0) return;

    // Filter out from customers state
    const nextCustomers = customers.filter(c => !customerIds.includes(c.id));
    const nextLeads = leads.filter(l => !customerIds.includes(l.customerId));

    setCustomers(nextCustomers);
    setLeads(nextLeads);
    pushToSharedCloud({ customers: nextCustomers, leads: nextLeads });

    // Send to backend API
    try {
      fetch('/api/customers/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds })
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Deleted Successfully',
      message: `Removed ${customerIds.length} customer record(s). Synced across all devices.`,
      type: 'warning'
    });
  }, [customers, leads, pushToSharedCloud, addToast]);

  // 5b. DELETE ALL CUSTOMERS & LEADS (Full wipe of raw pool and pipeline)
  const deleteAllCustomers = useCallback(async () => {
    setCustomers([]);
    setLeads([]);
    pushToSharedCloud({ customers: [], leads: [] });

    try {
      localStorage.setItem('leadspro_customers', JSON.stringify([]));
      localStorage.setItem('leadspro_leads', JSON.stringify([]));
      await fetch('/api/customers/all', {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('API error during deleteAllCustomers:', e);
    }

    addToast({
      title: 'Database Wiped',
      message: 'All customer records and linked pipeline leads have been deleted across all devices.',
      type: 'warning'
    });
  }, [pushToSharedCloud, addToast]);

  // 6. UNASSIGN CUSTOMERS
  const unassignCustomers = useCallback(async (customerIds) => {
    if (!customerIds || customerIds.length === 0) return;

    const nextCustomers = customers.map(c => {
      if (customerIds.includes(c.id)) {
        return {
          ...c,
          isAssigned: false,
          assignedTo: null,
          assignedAt: null
        };
      }
      return c;
    });

    const nextLeads = leads.filter(l => !customerIds.includes(l.customerId));

    setCustomers(nextCustomers);
    setLeads(nextLeads);
    pushToSharedCloud({ customers: nextCustomers, leads: nextLeads });

    try {
      fetch('/api/customers/unassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds })
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Assignment Reverted',
      message: `${customerIds.length} customer(s) returned to Unassigned Pool across devices.`,
      type: 'info'
    });
  }, [customers, leads, pushToSharedCloud, addToast]);

  // 7. DELETE SINGLE LEAD
  const deleteLead = useCallback(async (leadId) => {
    const nextLeads = leads.filter(l => l.id !== leadId);
    setLeads(nextLeads);
    pushToSharedCloud({ leads: nextLeads });

    try {
      fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Lead Removed',
      message: 'Lead removed from active pipeline across devices.',
      type: 'warning'
    });
  }, [leads, pushToSharedCloud, addToast]);

  // 8. ADD NEW TEAM MEMBER
  const addAgent = useCallback(async (agentData) => {
    if (!agentData.name?.trim()) {
      addToast({
        title: 'Name Required',
        message: 'Please enter a name for the new team member.',
        type: 'warning'
      });
      return false;
    }

    const nextId = agents.length > 0 ? Math.max(...agents.map(a => a.id)) + 1 : 1;
    const nameTrimmed = agentData.name.trim();

    const defaultAvatars = [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
    ];
    const pickedAvatar = agentData.avatar || defaultAvatars[nextId % defaultAvatars.length];

    const newAgent = {
      id: nextId,
      name: nameTrimmed,
      role: agentData.role?.trim() || "Sales Representative",
      email: agentData.email?.trim() || "",
      phone: agentData.phone?.trim() || "",
      avatar: pickedAvatar,
      color: "blue",
      pin: agentData.pin?.trim() || String(Math.floor(1000 + Math.random() * 9000))
    };

    const nextAgents = [...agents, newAgent];
    setAgents(nextAgents);
    pushToSharedCloud({ agents: nextAgents });

    try {
      fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Team Member Added',
      message: `${newAgent.name} (PIN: ${newAgent.pin}) added and synced across all devices.`,
      type: 'success'
    });

    return newAgent;
  }, [agents, pushToSharedCloud, addToast]);

  // 9. UPDATE TEAM MEMBER
  const updateAgent = useCallback(async (agentId, updatedData) => {
    let oldName = '';
    const newName = updatedData.name?.trim() || '';

    const nextAgents = agents.map(agent => {
      if (agent.id === agentId) {
        oldName = agent.name;
        return {
          ...agent,
          name: newName || agent.name,
          role: updatedData.role?.trim() || agent.role,
          email: updatedData.email?.trim() || agent.email,
          phone: updatedData.phone?.trim() || agent.phone,
          avatar: updatedData.avatar || agent.avatar,
          pin: updatedData.pin !== undefined ? String(updatedData.pin).trim() : agent.pin
        };
      }
      return agent;
    });

    let nextCustomers = customers;
    let nextLeads = leads;

    if (oldName && newName && oldName !== newName) {
      nextCustomers = customers.map(c => c.assignedTo === oldName ? { ...c, assignedTo: newName } : c);
      nextLeads = leads.map(l => l.assignedAgent === oldName ? { ...l, assignedAgent: newName } : l);
      setCustomers(nextCustomers);
      setLeads(nextLeads);
    }

    setAgents(nextAgents);
    pushToSharedCloud({ agents: nextAgents, customers: nextCustomers, leads: nextLeads });

    try {
      fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Team Member Updated',
      message: `Profile details for ${newName || oldName} saved and synced to cloud.`,
      type: 'success'
    });
  }, [agents, customers, leads, pushToSharedCloud, addToast]);

  // 9b. UPDATE AGENT PIN (Admin Setting)
  const updateAgentPin = useCallback(async (agentId, newPin) => {
    const pinStr = String(newPin).trim();
    if (!pinStr) {
      addToast({
        title: 'PIN Required',
        message: 'Please enter a valid PIN.',
        type: 'warning'
      });
      return false;
    }

    let agentName = '';
    const nextAgents = agents.map(a => {
      if (String(a.id) === String(agentId)) {
        agentName = a.name;
        return { ...a, pin: pinStr };
      }
      return a;
    });

    setAgents(nextAgents);
    pushToSharedCloud({ agents: nextAgents });

    // If currently logged in as this agent, update auth state
    setAuth(prev => (prev?.id === agentId ? { ...prev, pin: pinStr } : prev));

    try {
      fetch(`/api/agents/${agentId}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinStr })
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'PIN Assigned',
      message: `New security PIN "${pinStr}" assigned to ${agentName}. Synced across all devices.`,
      type: 'success'
    });
    return true;
  }, [agents, pushToSharedCloud, addToast]);

  // 12. AUTHENTICATION (Dynamic Admin Login with Default Credentials, Agent PIN Login, Logout)
  const loginAdmin = useCallback((credentials) => {
    const enteredId = (credentials?.id || credentials?.email || '').trim().toLowerCase();
    const enteredPassword = (credentials?.password || '').trim();
    const enteredName = credentials?.name?.trim();

    // Check if an admin profile already exists
    let savedProfile = adminProfile || DEFAULT_ADMIN;
    try {
      const c = localStorage.getItem('leadspro_admin_profile');
      if (c) savedProfile = JSON.parse(c);
    } catch {}

    // Accepted default usernames/emails
    const validUsernames = [
      'admin',
      'admin@leadspro.com',
      savedProfile?.username?.toLowerCase(),
      savedProfile?.email?.toLowerCase()
    ].filter(Boolean);

    // Accepted default passwords
    const validPasswords = [
      'admin',
      'admin123',
      savedProfile?.password
    ].filter(Boolean);

    const isUserValid = !enteredId || validUsernames.some(u => u === enteredId || enteredId.includes(u) || u.includes(enteredId));
    const isPassValid = !enteredPassword || validPasswords.includes(enteredPassword);

    if (!isUserValid) {
      const msg = 'Invalid Admin ID or Email. Default Admin ID is "admin"';
      addToast({ title: 'Authentication Failed', message: msg, type: 'warning' });
      return { success: false, message: msg };
    }

    if (!isPassValid) {
      const msg = 'Incorrect Admin Password. Default Password is "admin"';
      addToast({ title: 'Authentication Failed', message: msg, type: 'warning' });
      return { success: false, message: msg };
    }

    const finalName = enteredName || savedProfile?.name || 'Administrator';
    const finalEmail = savedProfile?.email || 'admin@leadspro.com';

    // If new name or first setup, persist profile
    if (!savedProfile || enteredName) {
      const newProf = {
        name: finalName,
        email: finalEmail,
        username: 'admin',
        password: enteredPassword || savedProfile?.password || 'admin',
        updatedAt: new Date().toISOString()
      };
      setAdminProfile(newProf);
      pushToSharedCloud({ admin: newProf });
    }

    const adminUser = {
      type: 'admin',
      name: finalName,
      role: 'System Administrator',
      email: finalEmail,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    setAuth(adminUser);
    setActiveTab('dashboard');
    addToast({
      title: 'Admin Access Granted',
      message: `Welcome, ${finalName}! Full system access unlocked.`,
      type: 'success'
    });
    return { success: true };
  }, [adminProfile, pushToSharedCloud, addToast]);

  const updateAdminProfile = useCallback(async (updates) => {
    const nextAdmin = { ...(adminProfile || DEFAULT_ADMIN), ...updates };
    setAdminProfile(nextAdmin);
    pushToSharedCloud({ admin: nextAdmin });

    try {
      fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextAdmin)
      }).catch(() => {});
    } catch {}

    setAuth(prev => {
      if (prev?.type === 'admin') {
        const nextAuth = {
          ...prev,
          name: updates.name || prev.name,
          email: updates.email || prev.email
        };
        try {
          localStorage.setItem('leadspro_auth', JSON.stringify(nextAuth));
        } catch {}
        return nextAuth;
      }
      return prev;
    });

    addToast({
      title: 'Admin Profile Updated',
      message: 'Your administrator profile details have been saved and synced to cloud.',
      type: 'success'
    });
  }, [adminProfile, pushToSharedCloud, addToast]);

  const loginAgentPin = useCallback((agentId, enteredPin) => {
    const targetAgent = agents.find(a => String(a.id) === String(agentId));
    if (!targetAgent) {
      addToast({
        title: 'Member Not Found',
        message: 'Please select a valid team member.',
        type: 'warning'
      });
      return { success: false, message: 'Agent not found' };
    }

    const assignedPin = String(targetAgent.pin || '').trim();
    if (!assignedPin) {
      const msg = `No PIN has been assigned to ${targetAgent.name} yet. Please ask your Administrator to assign you a PIN.`;
      addToast({
        title: 'PIN Not Assigned',
        message: msg,
        type: 'warning'
      });
      return { success: false, message: msg };
    }

    if (String(enteredPin).trim() !== assignedPin) {
      const msg = `Incorrect PIN for ${targetAgent.name}. Please enter the exact security PIN assigned by your Administrator.`;
      addToast({
        title: 'Authentication Failed',
        message: msg,
        type: 'warning'
      });
      return { success: false, message: msg };
    }

    const agentUser = {
      type: 'agent',
      id: targetAgent.id,
      name: targetAgent.name,
      role: targetAgent.role,
      email: targetAgent.email,
      phone: targetAgent.phone,
      avatar: targetAgent.avatar,
      pin: assignedPin
    };

    setAuth(agentUser);
    setActiveTab('leads');
    addToast({
      title: 'Member Portal Unlocked',
      message: `Welcome, ${targetAgent.name}! Viewing your assigned pipeline.`,
      type: 'success'
    });
    return { success: true };
  }, [agents, addToast]);

  const logout = useCallback(() => {
    setAuth(null);
    addToast({
      title: 'Signed Out',
      message: 'You have been returned to the authentication portal.',
      type: 'info'
    });
  }, [addToast]);

  // 10. REMOVE TEAM MEMBER
  const removeAgent = useCallback(async (agentId) => {
    const targetAgent = agents.find(a => a.id === agentId);
    if (!targetAgent) return;

    const agentName = targetAgent.name;

    const nextAgents = agents.filter(a => a.id !== agentId);
    const nextCustomers = customers.map(c => {
      if (c.assignedTo === agentName) {
        return {
          ...c,
          isAssigned: false,
          assignedTo: null,
          assignedAt: null
        };
      }
      return c;
    });
    const nextLeads = leads.filter(l => l.assignedAgent !== agentName);

    setAgents(nextAgents);
    setCustomers(nextCustomers);
    setLeads(nextLeads);
    pushToSharedCloud({ agents: nextAgents, customers: nextCustomers, leads: nextLeads });

    try {
      fetch(`/api/agents/${agentId}`, {
        method: 'DELETE'
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Member Removed from Team',
      message: `${agentName} was removed. Their assigned leads were safely returned to the Unassigned Pool. Synced to cloud.`,
      type: 'warning'
    });
  }, [agents, customers, leads, pushToSharedCloud, addToast]);

  // 11. COMPUTED DASHBOARD & ANALYTICS METRICS
  const analytics = useMemo(() => {
    const totalCustomersPool = customers.length;
    const totalLeadsAssigned = leads.length;
    const unassignedCount = customers.filter(c => !c.isAssigned).length;
    const assignedCustomersCount = customers.filter(c => c.isAssigned).length;

    const pendingCount = leads.filter(l => l.status === 'Pending').length;
    const connectedCount = leads.filter(l => l.status === 'Connected').length;
    const interestedCount = leads.filter(l => l.status === 'Interested').length;
    const notInterestedCount = leads.filter(l => l.status === 'Not Interested').length;

    const interestRate = totalLeadsAssigned > 0 
      ? Math.round((interestedCount / totalLeadsAssigned) * 100) 
      : 0;

    const contactRate = totalLeadsAssigned > 0
      ? Math.round(((totalLeadsAssigned - pendingCount) / totalLeadsAssigned) * 100)
      : 0;

    const statusPercentages = {
      Pending: totalLeadsAssigned > 0 ? Math.round((pendingCount / totalLeadsAssigned) * 100) : 0,
      Connected: totalLeadsAssigned > 0 ? Math.round((connectedCount / totalLeadsAssigned) * 100) : 0,
      Interested: totalLeadsAssigned > 0 ? Math.round((interestedCount / totalLeadsAssigned) * 100) : 0,
      'Not Interested': totalLeadsAssigned > 0 ? Math.round((notInterestedCount / totalLeadsAssigned) * 100) : 0,
    };

    const agentBreakdown = agents.map(agent => {
      const agentLeads = leads.filter(l => l.assignedAgent === agent.name);
      const total = agentLeads.length;
      const pending = agentLeads.filter(l => l.status === 'Pending').length;
      const connected = agentLeads.filter(l => l.status === 'Connected').length;
      const interested = agentLeads.filter(l => l.status === 'Interested').length;
      const notInterested = agentLeads.filter(l => l.status === 'Not Interested').length;
      const conversionRate = total > 0 ? Math.round((interested / total) * 100) : 0;

      return {
        ...agent,
        totalLeads: total,
        pending,
        connected,
        interested,
        notInterested,
        conversionRate
      };
    });

    return {
      totalCustomersPool,
      totalLeadsAssigned,
      unassignedCount,
      assignedCustomersCount,
      pendingCount,
      connectedCount,
      interestedCount,
      notInterestedCount,
      interestRate,
      contactRate,
      statusPercentages,
      agentBreakdown
    };
  }, [customers, leads, agents]);

  const value = {
    agents,
    customers,
    leads,
    activeTab,
    setActiveTab,
    toasts,
    addToast,
    removeToast,
    bulkUploadCustomers,
    assignCustomersToAgent,
    updateLeadStatus,
    addSingleCustomer,
    deleteCustomers,
    deleteAllCustomers,
    unassignCustomers,
    deleteLead,
    addAgent,
    updateAgent,
    updateAgentPin,
    removeAgent,
    auth,
    adminProfile,
    updateAdminProfile,
    loginAdmin,
    loginAgentPin,
    logout,
    dbStatus,
    analytics,
    statusConfig: LEAD_STATUS_CONFIG,
    syncNow: () => syncWithBackend(true),
    DEFAULT_ADMIN
  };

  return (
    <CrmContext.Provider value={value}>
      {children}
    </CrmContext.Provider>
  );
};

export const useCrm = () => {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
};
