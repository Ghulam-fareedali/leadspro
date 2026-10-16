import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  INITIAL_AGENTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_LEADS, 
  LEAD_STATUS_CONFIG 
} from '../data/customerData';

const CrmContext = createContext(null);

export const CrmProvider = ({ children }) => {
  // Load cached state or fallback to initial data
  const [agents, setAgents] = useState(() => {
    try {
      const cached = localStorage.getItem('leadspro_agents');
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.map((a, idx) => ({
          ...a,
          pin: a.pin || INITIAL_AGENTS[idx]?.pin || "1234"
        }));
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

  // Sync with Backend API on mount
  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          const hasMongo = healthData.mongodbUriSet;

          setDbStatus({
            connected: hasMongo,
            mode: hasMongo ? 'mongodb' : 'server-local',
            message: hasMongo ? 'MongoDB Connected' : 'Express Server Running (Add MONGODB_URI to connect MongoDB Atlas)'
          });

          // Fetch agents from API
          const [agentRes, custRes, leadRes] = await Promise.all([
            fetch('/api/agents').catch(() => null),
            fetch('/api/customers').catch(() => null),
            fetch('/api/leads').catch(() => null)
          ]);

          if (agentRes && agentRes.ok) {
            const agentData = await agentRes.json();
            if (agentData.data && agentData.data.length > 0) {
              setAgents(agentData.data);
            }
          }

          if (custRes && custRes.ok) {
            const custData = await custRes.json();
            if (custData.data && custData.data.length > 0) {
              setCustomers(custData.data);
            }
          }

          if (leadRes && leadRes.ok) {
            const leadData = await leadRes.json();
            if (leadData.data && leadData.data.length > 0) {
              setLeads(leadData.data);
            }
          }
        }
      } catch (err) {
        // Backend not yet running or static mode: continue smoothly with local storage
        setDbStatus({
          connected: false,
          mode: 'local',
          message: 'Local Offline Cache'
        });
      }
    };

    syncWithBackend();
  }, []);

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

    // Update local state immediately
    setCustomers(prev => [...formattedRecords, ...prev]);

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
      message: `Successfully uploaded ${formattedRecords.length} customer records from "${fileName}".`,
      type: 'success'
    });

    return formattedRecords;
  }, [customers, addToast]);

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
    setCustomers(prevCustomers => {
      return prevCustomers.map(c => {
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

    setLeads(prevLeads => [...newLeads, ...prevLeads]);

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
      message: `${customerIds.length} customer(s) successfully routed to ${agentName}. Now active in Leads pipeline as "Pending".`,
      type: 'success'
    });

    return true;
  }, [customers, leads, addToast]);

  // 3. STATUS TRACKING & UPDATING (Module 2)
  const updateLeadStatus = useCallback(async (leadId, newStatus, note = '') => {
    let leadName = '';

    setLeads(prevLeads => {
      return prevLeads.map(lead => {
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
    });

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
      message: `"${leadName}" marked as "${newStatus}". Dashboard analytics refreshed.`,
      type: newStatus === 'Interested' ? 'success' : newStatus === 'Not Interested' ? 'warning' : 'info'
    });
  }, [addToast]);

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

    setCustomers(prev => [newCust, ...prev]);

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
      message: `"${newCust.name}" added to Raw Customers pool.`,
      type: 'success'
    });

    return newCust;
  }, [customers, addToast]);

  // 5. DELETE CUSTOMERS (Single or Bulk, including assigned & imported ones)
  const deleteCustomers = useCallback(async (customerIds) => {
    if (!customerIds || customerIds.length === 0) return;

    // Filter out from customers state
    setCustomers(prev => prev.filter(c => !customerIds.includes(c.id)));

    // Also remove from leads state
    setLeads(prev => prev.filter(l => !customerIds.includes(l.customerId)));

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
      message: `Removed ${customerIds.length} customer record(s). Any assigned pipeline leads were also cleaned up.`,
      type: 'warning'
    });
  }, [addToast]);

  // 5b. DELETE ALL CUSTOMERS & LEADS (Full wipe of raw pool and pipeline)
  const deleteAllCustomers = useCallback(async () => {
    setCustomers([]);
    setLeads([]);

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
      message: 'All customer records and linked pipeline leads have been deleted from the database.',
      type: 'warning'
    });
  }, [addToast]);

  // 6. UNASSIGN CUSTOMERS
  const unassignCustomers = useCallback(async (customerIds) => {
    if (!customerIds || customerIds.length === 0) return;

    setCustomers(prev => prev.map(c => {
      if (customerIds.includes(c.id)) {
        return {
          ...c,
          isAssigned: false,
          assignedTo: null,
          assignedAt: null
        };
      }
      return c;
    }));

    setLeads(prev => prev.filter(l => !customerIds.includes(l.customerId)));

    try {
      fetch('/api/customers/unassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds })
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Assignment Reverted',
      message: `${customerIds.length} customer(s) returned to Unassigned Pool.`,
      type: 'info'
    });
  }, [addToast]);

  // 7. DELETE SINGLE LEAD
  const deleteLead = useCallback(async (leadId) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));

    try {
      fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Lead Removed',
      message: 'Lead removed from active pipeline.',
      type: 'warning'
    });
  }, [addToast]);

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
      email: agentData.email?.trim() || `${nameTrimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}@omniflow.io`,
      phone: agentData.phone?.trim() || "0300-1234567",
      avatar: pickedAvatar,
      color: "blue",
      pin: agentData.pin?.trim() || "1234"
    };

    setAgents(prev => [...prev, newAgent]);

    try {
      fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgent)
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Team Member Added',
      message: `${newAgent.name} is now available in your team & lead assignment dropdowns.`,
      type: 'success'
    });

    return newAgent;
  }, [agents, addToast]);

  // 9. UPDATE TEAM MEMBER
  const updateAgent = useCallback(async (agentId, updatedData) => {
    let oldName = '';
    const newName = updatedData.name?.trim() || '';

    setAgents(prev => prev.map(agent => {
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
    }));

    if (oldName && newName && oldName !== newName) {
      setCustomers(prev => prev.map(c => c.assignedTo === oldName ? { ...c, assignedTo: newName } : c));
      setLeads(prev => prev.map(l => l.assignedAgent === oldName ? { ...l, assignedAgent: newName } : l));
    }

    try {
      fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Team Member Updated',
      message: `Profile details for ${newName || oldName} have been saved.`,
      type: 'success'
    });
  }, [addToast]);

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
    setAgents(prev => prev.map(a => {
      if (String(a.id) === String(agentId)) {
        agentName = a.name;
        return { ...a, pin: pinStr };
      }
      return a;
    }));

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
      message: `New security PIN "${pinStr}" assigned to ${agentName}.`,
      type: 'success'
    });
    return true;
  }, [addToast]);

  // 12. AUTHENTICATION (Admin Login, Agent PIN Login, Logout)
  const loginAdmin = useCallback((credentials) => {
    const email = credentials?.email?.trim() || 'admin@omniflow.io';
    const adminUser = {
      type: 'admin',
      name: 'Ali Khan',
      role: 'System Administrator',
      email: email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    setAuth(adminUser);
    setActiveTab('dashboard');
    addToast({
      title: 'Admin Access Granted',
      message: `Welcome, ${adminUser.name}. Full system access unlocked.`,
      type: 'success'
    });
    return { success: true };
  }, [addToast]);

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

    const correctPin = String(targetAgent.pin || '1234').trim();
    if (String(enteredPin).trim() !== correctPin) {
      addToast({
        title: 'Authentication Failed',
        message: `Incorrect PIN for ${targetAgent.name}. Contact your Admin.`,
        type: 'warning'
      });
      return { success: false, message: 'Invalid PIN' };
    }

    const agentUser = {
      type: 'agent',
      id: targetAgent.id,
      name: targetAgent.name,
      role: targetAgent.role,
      email: targetAgent.email,
      phone: targetAgent.phone,
      avatar: targetAgent.avatar,
      pin: correctPin
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

    setAgents(prev => prev.filter(a => a.id !== agentId));

    setCustomers(prev => prev.map(c => {
      if (c.assignedTo === agentName) {
        return {
          ...c,
          isAssigned: false,
          assignedTo: null,
          assignedAt: null
        };
      }
      return c;
    }));

    setLeads(prev => prev.filter(l => l.assignedAgent !== agentName));

    try {
      fetch(`/api/agents/${agentId}`, {
        method: 'DELETE'
      }).catch(() => {});
    } catch {}

    addToast({
      title: 'Member Removed from Team',
      message: `${agentName} was removed. Their assigned leads were safely returned to the Unassigned Pool.`,
      type: 'warning'
    });
  }, [agents, addToast]);

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
    loginAdmin,
    loginAgentPin,
    logout,
    dbStatus,
    analytics,
    statusConfig: LEAD_STATUS_CONFIG
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
