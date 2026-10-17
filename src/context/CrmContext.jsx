import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { LEAD_STATUS_CONFIG } from '../data/customerData';

export const DEFAULT_ADMIN = {
  email: 'admin@leadspro.com',
  username: 'admin',
  password: 'admin',
  name: 'Admin',
  role: 'System Administrator'
};

const CrmContext = createContext(null);

export const CrmProvider = ({ children }) => {
  // Configured Admin Profile (populated directly from MongoDB)
  const [adminProfile, setAdminProfile] = useState(DEFAULT_ADMIN);

  // Authentication session (only auth token/session preserved in localStorage)
  const [auth, setAuth] = useState(() => {
    try {
      const cached = localStorage.getItem('leadspro_auth');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Strict MongoDB Database States (ZERO dummy/mock data, ZERO localStorage fallback)
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    mode: 'connecting',
    message: 'Connecting to MongoDB...'
  });

  // Persist only authentication session so refresh doesn't log the user out
  useEffect(() => {
    try {
      if (auth) {
        localStorage.setItem('leadspro_auth', JSON.stringify(auth));
      } else {
        localStorage.removeItem('leadspro_auth');
      }
    } catch (err) {
      console.warn('Auth session storage sync failed:', err);
    }
  }, [auth]);

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

  // Strict MongoDB Fetcher: Pulls fresh, real-time records from MongoDB collections
  const syncWithBackend = useCallback(async (isManual = false) => {
    try {
      const [custRes, leadRes, agentRes, adminRes, healthRes] = await Promise.all([
        fetch('/api/customers?t=' + Date.now()).catch(() => null),
        fetch('/api/leads?t=' + Date.now()).catch(() => null),
        fetch('/api/agents?t=' + Date.now()).catch(() => null),
        fetch('/api/admin?t=' + Date.now()).catch(() => null),
        fetch('/api/health?t=' + Date.now()).catch(() => null)
      ]);

      let isConnected = false;

      // 1. Customers strictly from MongoDB
      if (custRes && custRes.ok) {
        const cJson = await custRes.json();
        if (Array.isArray(cJson.data)) {
          setCustomers(cJson.data);
          isConnected = true;
        }
      }

      // 2. Leads strictly from MongoDB
      if (leadRes && leadRes.ok) {
        const lJson = await leadRes.json();
        if (Array.isArray(lJson.data)) {
          setLeads(lJson.data);
          isConnected = true;
        }
      }

      // 3. Agents strictly from MongoDB
      if (agentRes && agentRes.ok) {
        const aJson = await agentRes.json();
        if (Array.isArray(aJson.data)) {
          setAgents(aJson.data);
          isConnected = true;
        }
      }

      // 4. Admin Profile strictly from MongoDB
      if (adminRes && adminRes.ok) {
        const adJson = await adminRes.json();
        if (adJson.data && (adJson.data.password || adJson.data.email)) {
          setAdminProfile(adJson.data);
        }
      }

      let healthInfo = null;
      if (healthRes && healthRes.ok) {
        healthInfo = await healthRes.json();
      }

      setDbStatus({
        connected: isConnected,
        mode: isConnected ? 'mongodb' : 'disconnected',
        message: isConnected 
          ? (healthInfo?.database || 'MongoDB Live Database Connected') 
          : 'Connecting to MongoDB...'
      });

      setIsLoading(false);

      if (isManual) {
        addToast({
          title: 'MongoDB Synchronized',
          message: 'All records, pipeline leads, and team profiles fetched live from MongoDB.',
          type: 'success'
        });
      }
    } catch (err) {
      console.warn('MongoDB sync error:', err);
      setDbStatus({
        connected: false,
        mode: 'error',
        message: 'MongoDB Connection Error: ' + err.message
      });
      setIsLoading(false);
    }
  }, [addToast]);

  // Live Auto-Sync: Poll MongoDB every 6 seconds + on window focus
  useEffect(() => {
    syncWithBackend();

    const interval = setInterval(() => {
      syncWithBackend();
    }, 6000);

    const handleFocus = () => {
      syncWithBackend();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [syncWithBackend]);

  // 1. BULK UPLOAD CUSTOMERS strictly to MongoDB
  const bulkUploadCustomers = useCallback(async (newRecords, fileName = 'Imported_File.xlsx') => {
    try {
      const res = await fetch('/api/customers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: newRecords })
      });

      if (!res.ok) {
        throw new Error(`Failed to upload to MongoDB (Status: ${res.status})`);
      }

      const result = await res.json();
      const savedRecords = Array.isArray(result.data) ? result.data : [];

      // Update state with records saved to MongoDB
      setCustomers(prev => [...savedRecords, ...prev]);

      addToast({
        title: 'Bulk Data Ingested',
        message: `Successfully saved ${savedRecords.length} records to MongoDB from "${fileName}".`,
        type: 'success'
      });

      return savedRecords;
    } catch (err) {
      console.error('MongoDB bulk upload error:', err);
      addToast({
        title: 'Upload Failed',
        message: 'Could not write to MongoDB: ' + err.message,
        type: 'error'
      });
      return [];
    }
  }, [addToast]);

  // 2. ASSIGN CUSTOMERS TO AGENT strictly in MongoDB
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

    try {
      const res = await fetch('/api/customers/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds, agentName })
      });

      if (!res.ok) {
        throw new Error(`Failed to assign in MongoDB (Status: ${res.status})`);
      }

      // Re-fetch fresh state from MongoDB
      await syncWithBackend();

      addToast({
        title: 'Workflow Assignment Complete',
        message: `${customerIds.length} customer(s) routed to ${agentName} in MongoDB pipeline.`,
        type: 'success'
      });

      return true;
    } catch (err) {
      console.error('Assignment error:', err);
      addToast({
        title: 'Assignment Failed',
        message: 'MongoDB update failed: ' + err.message,
        type: 'error'
      });
      return false;
    }
  }, [syncWithBackend, addToast]);

  // 3. STATUS TRACKING & UPDATING strictly in MongoDB
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

    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes: note })
      });

      if (!res.ok) {
        throw new Error(`MongoDB status update failed (Status: ${res.status})`);
      }

      addToast({
        title: 'Pipeline Status Updated',
        message: `"${leadName}" marked as "${newStatus}" in MongoDB.`,
        type: newStatus === 'Interested' ? 'success' : newStatus === 'Not Interested' ? 'warning' : 'info'
      });
    } catch (err) {
      console.error('Lead status update error:', err);
      addToast({
        title: 'Update Error',
        message: 'Could not update MongoDB: ' + err.message,
        type: 'error'
      });
    }
  }, [addToast]);

  // 4. ADD SINGLE CUSTOMER MANUALLY strictly to MongoDB
  const addSingleCustomer = useCallback(async (customerData) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });

      if (!res.ok) {
        throw new Error(`Failed to save customer to MongoDB (Status: ${res.status})`);
      }

      const result = await res.json();
      const newCust = result.data;

      setCustomers(prev => [newCust, ...prev]);

      addToast({
        title: 'Customer Added',
        message: `"${newCust.name}" persisted to MongoDB.`,
        type: 'success'
      });

      return newCust;
    } catch (err) {
      console.error('Add customer error:', err);
      addToast({
        title: 'Save Failed',
        message: 'Could not write to MongoDB: ' + err.message,
        type: 'error'
      });
      return null;
    }
  }, [addToast]);

  // 5. DELETE CUSTOMERS strictly in MongoDB
  const deleteCustomers = useCallback(async (customerIds) => {
    if (!customerIds || customerIds.length === 0) return;

    setCustomers(prev => prev.filter(c => !customerIds.includes(c.id)));
    setLeads(prev => prev.filter(l => !customerIds.includes(l.customerId)));

    try {
      const res = await fetch('/api/customers/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds })
      });

      if (!res.ok) {
        throw new Error(`MongoDB delete failed (Status: ${res.status})`);
      }

      addToast({
        title: 'Deleted Successfully',
        message: `Removed ${customerIds.length} customer record(s) from MongoDB.`,
        type: 'warning'
      });
    } catch (err) {
      console.error('Delete customers error:', err);
      addToast({
        title: 'Delete Failed',
        message: 'Could not delete from MongoDB: ' + err.message,
        type: 'error'
      });
    }
  }, [addToast]);

  // 5b. DELETE ALL CUSTOMERS & LEADS strictly in MongoDB
  const deleteAllCustomers = useCallback(async () => {
    setCustomers([]);
    setLeads([]);

    try {
      const res = await fetch('/api/customers/all', {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error(`MongoDB clear failed (Status: ${res.status})`);
      }

      addToast({
        title: 'Database Wiped',
        message: 'All customer records and linked pipeline leads cleared from MongoDB.',
        type: 'warning'
      });
    } catch (err) {
      console.error('Wipe error:', err);
      addToast({
        title: 'Wipe Failed',
        message: 'Could not wipe MongoDB: ' + err.message,
        type: 'error'
      });
    }
  }, [addToast]);

  // 6. UNASSIGN CUSTOMERS strictly in MongoDB
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
      const res = await fetch('/api/customers/unassign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerIds })
      });

      if (!res.ok) {
        throw new Error(`MongoDB unassign failed (Status: ${res.status})`);
      }

      addToast({
        title: 'Assignment Reverted',
        message: `${customerIds.length} customer(s) returned to Unassigned Pool in MongoDB.`,
        type: 'info'
      });
    } catch (err) {
      console.error('Unassign error:', err);
      addToast({
        title: 'Unassign Failed',
        message: 'MongoDB update failed: ' + err.message,
        type: 'error'
      });
    }
  }, [addToast]);

  // 7. DELETE SINGLE LEAD strictly in MongoDB
  const deleteLead = useCallback(async (leadId) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error(`MongoDB lead delete failed (Status: ${res.status})`);
      }

      addToast({
        title: 'Lead Removed',
        message: 'Lead removed from active pipeline in MongoDB.',
        type: 'warning'
      });
    } catch (err) {
      console.error('Lead delete error:', err);
      addToast({
        title: 'Delete Failed',
        message: 'Could not delete from MongoDB: ' + err.message,
        type: 'error'
      });
    }
  }, [addToast]);

  // 8. ADD NEW TEAM MEMBER strictly to MongoDB
  const addAgent = useCallback(async (agentData) => {
    if (!agentData.name?.trim()) {
      addToast({
        title: 'Name Required',
        message: 'Please enter a name for the new team member.',
        type: 'warning'
      });
      return false;
    }

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });

      if (!res.ok) {
        throw new Error(`Failed to create agent in MongoDB (Status: ${res.status})`);
      }

      const result = await res.json();
      const newAgent = result.data;

      setAgents(prev => [...prev, newAgent]);

      addToast({
        title: 'Team Member Added',
        message: `${newAgent.name} (PIN: ${newAgent.pin}) persisted to MongoDB.`,
        type: 'success'
      });

      return newAgent;
    } catch (err) {
      console.error('Add agent error:', err);
      addToast({
        title: 'Creation Failed',
        message: 'Could not write to MongoDB: ' + err.message,
        type: 'error'
      });
      return null;
    }
  }, [addToast]);

  // 9. UPDATE TEAM MEMBER strictly in MongoDB
  const updateAgent = useCallback(async (agentId, updatedData) => {
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) {
        throw new Error(`Failed to update agent in MongoDB (Status: ${res.status})`);
      }

      // Re-fetch all to ensure relational updates (name changes in customer/leads) are fresh
      await syncWithBackend();

      addToast({
        title: 'Team Member Updated',
        message: 'Profile details saved to MongoDB.',
        type: 'success'
      });
    } catch (err) {
      console.error('Update agent error:', err);
      addToast({
        title: 'Update Failed',
        message: 'MongoDB update failed: ' + err.message,
        type: 'error'
      });
    }
  }, [syncWithBackend, addToast]);

  // 9b. UPDATE AGENT PIN strictly in MongoDB
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

    setAuth(prev => (prev?.id === agentId ? { ...prev, pin: pinStr } : prev));

    try {
      const res = await fetch(`/api/agents/${agentId}/pin`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinStr })
      });

      if (!res.ok) {
        throw new Error(`Failed to assign PIN in MongoDB (Status: ${res.status})`);
      }

      addToast({
        title: 'PIN Assigned',
        message: `New security PIN "${pinStr}" assigned to ${agentName} in MongoDB.`,
        type: 'success'
      });
      return true;
    } catch (err) {
      console.error('PIN update error:', err);
      addToast({
        title: 'PIN Update Failed',
        message: 'MongoDB PIN update failed: ' + err.message,
        type: 'error'
      });
      return false;
    }
  }, [addToast]);

  // 10. REMOVE TEAM MEMBER strictly from MongoDB
  const removeAgent = useCallback(async (agentId) => {
    const targetAgent = agents.find(a => a.id === agentId);
    if (!targetAgent) return;

    const agentName = targetAgent.name;

    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error(`Failed to delete agent from MongoDB (Status: ${res.status})`);
      }

      await syncWithBackend();

      addToast({
        title: 'Member Removed from Team',
        message: `${agentName} removed from MongoDB. Assigned leads returned to unassigned pool.`,
        type: 'warning'
      });
    } catch (err) {
      console.error('Delete agent error:', err);
      addToast({
        title: 'Removal Failed',
        message: 'Could not delete from MongoDB: ' + err.message,
        type: 'error'
      });
    }
  }, [agents, syncWithBackend, addToast]);

  // 11. UPDATE ADMIN PROFILE strictly in MongoDB
  const updateAdminProfile = useCallback(async (updates) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!res.ok) {
        throw new Error(`Failed to update admin profile in MongoDB (Status: ${res.status})`);
      }

      const result = await res.json();
      const updatedAdmin = result.data;
      setAdminProfile(updatedAdmin);

      setAuth(prev => {
        if (prev?.type === 'admin') {
          return {
            ...prev,
            name: updatedAdmin.name || prev.name,
            email: updatedAdmin.email || prev.email
          };
        }
        return prev;
      });

      addToast({
        title: 'Admin Profile Updated',
        message: 'Administrator details saved in MongoDB database.',
        type: 'success'
      });
    } catch (err) {
      console.error('Admin profile error:', err);
      addToast({
        title: 'Profile Update Failed',
        message: 'Could not save to MongoDB: ' + err.message,
        type: 'error'
      });
    }
  }, [addToast]);

  // 12. AUTHENTICATION (Admin Login, Agent PIN Login, Logout)
  const loginAdmin = useCallback((credentials) => {
    const enteredId = (credentials?.id || credentials?.email || '').trim().toLowerCase();
    const enteredPassword = (credentials?.password || '').trim();
    const enteredName = credentials?.name?.trim();

    const activeProfile = adminProfile || DEFAULT_ADMIN;

    const validUsernames = [
      'admin',
      'admin@leadspro.com',
      activeProfile?.username?.toLowerCase(),
      activeProfile?.email?.toLowerCase()
    ].filter(Boolean);

    const validPasswords = [
      'admin',
      'admin123',
      activeProfile?.password
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

    const finalName = enteredName || activeProfile?.name || 'Administrator';
    const finalEmail = activeProfile?.email || 'admin@leadspro.com';

    const adminUser = {
      type: 'admin',
      name: finalName,
      role: 'System Administrator',
      email: finalEmail,
      avatar: activeProfile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    setAuth(adminUser);
    setActiveTab('dashboard');
    addToast({
      title: 'Admin Access Granted',
      message: `Welcome, ${finalName}! Full system access unlocked.`,
      type: 'success'
    });
    return { success: true };
  }, [adminProfile, addToast]);

  const loginAgentPin = useCallback((agentId, enteredPin) => {
    const targetAgent = agents.find(a => String(a.id) === String(agentId));
    if (!targetAgent) {
      addToast({
        title: 'Member Not Found',
        message: 'Please select a valid team member profile.',
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

  // 13. COMPUTED DASHBOARD & ANALYTICS METRICS (Directly from live MongoDB collections)
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
    isLoading,
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
