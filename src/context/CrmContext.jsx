import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { 
  INITIAL_AGENTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_LEADS, 
  LEAD_STATUS_CONFIG 
} from '../data/customerData';

const CrmContext = createContext(null);

export const CrmProvider = ({ children }) => {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'customers', 'leads', 'team'
  const [toasts, setToasts] = useState([]);

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

  // 1. BULK UPLOAD CUSTOMERS (Module 1)
  const bulkUploadCustomers = useCallback((newRecords, fileName = 'Imported_File.xlsx') => {
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

    setCustomers(prev => [...formattedRecords, ...prev]);

    addToast({
      title: 'Bulk Data Ingested',
      message: `Successfully uploaded ${formattedRecords.length} customer records from "${fileName}".`,
      type: 'success'
    });

    return formattedRecords;
  }, [customers, addToast]);

  // 2. ASSIGN CUSTOMERS TO AGENT (The Crucial Workflow)
  // When an Admin selects customers and assigns them to an Agent:
  // - Customers status in Customers table changes to "Assigned"
  // - New records instantly appear in the "Leads" section with status "Pending"
  const assignCustomersToAgent = useCallback((customerIds, agentName) => {
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

    // Track matching customer details to spawn leads
    const customersToAssign = customers.filter(c => customerIds.includes(c.id));

    // Update customers state: mark isAssigned: true and assignedTo: agentName
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

    // Spawn corresponding Leads into the Leads pipeline with status "Pending"
    const newLeads = customersToAssign.map((cust, idx) => {
      // Generate clean unique lead ID
      const leadNum = 2000 + leads.length + idx + 1;
      return {
        id: `LEAD-${leadNum}`,
        customerId: cust.id,
        name: cust.name,
        phone: cust.phone,
        email: cust.email,
        source: cust.source,
        assignedAgent: agentName,
        status: 'Pending', // Default state when assigned (Gray or Yellow badge)
        notes: `Assigned to ${agentName} on ${formattedDate}. Awaiting first contact.`,
        assignedDate: formattedDate,
        lastContactDate: null
      };
    });

    setLeads(prevLeads => [...newLeads, ...prevLeads]);

    addToast({
      title: 'Workflow Assignment Complete',
      message: `${customerIds.length} customer(s) successfully routed to ${agentName}. Now active in Leads pipeline as "Pending".`,
      type: 'success'
    });

    return true;
  }, [customers, leads, addToast]);

  // 3. STATUS TRACKING & UPDATING (Module 2)
  // Each row has an interactive status dropdown (Pending, Connected, Interested, Not Interested)
  // Changing a lead's status dynamically updates the Dashboard analytics counts
  const updateLeadStatus = useCallback((leadId, newStatus, note = '') => {
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

    addToast({
      title: 'Pipeline Status Updated',
      message: `"${leadName}" marked as "${newStatus}". Dashboard analytics refreshed.`,
      type: newStatus === 'Interested' ? 'success' : newStatus === 'Not Interested' ? 'warning' : 'info'
    });
  }, [addToast]);

  // 4. ADD SINGLE CUSTOMER MANUALLY
  const addSingleCustomer = useCallback((customerData) => {
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

    addToast({
      title: 'Customer Added',
      message: `"${newCust.name}" added to Raw Customers pool.`,
      type: 'success'
    });

    return newCust;
  }, [customers, addToast]);

  // 5. DELETE CUSTOMERS (Single or Bulk, including assigned & imported ones)
  const deleteCustomers = useCallback((customerIds) => {
    if (!customerIds || customerIds.length === 0) return;

    // Filter out from customers state
    setCustomers(prev => prev.filter(c => !customerIds.includes(c.id)));

    // Also remove from leads state if any of these customers were assigned as leads
    setLeads(prev => prev.filter(l => !customerIds.includes(l.customerId)));

    addToast({
      title: 'Deleted Successfully',
      message: `Removed ${customerIds.length} customer record(s). Any assigned pipeline leads were also cleaned up.`,
      type: 'warning'
    });
  }, [addToast]);

  // 6. UNASSIGN CUSTOMERS (Revert back to Unassigned Pool without deleting)
  const unassignCustomers = useCallback((customerIds) => {
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

    // Remove from leads
    setLeads(prev => prev.filter(l => !customerIds.includes(l.customerId)));

    addToast({
      title: 'Assignment Reverted',
      message: `${customerIds.length} customer(s) returned to Unassigned Pool.`,
      type: 'info'
    });
  }, [addToast]);

  // 7. DELETE SINGLE LEAD (From Leads pipeline)
  const deleteLead = useCallback((leadId) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
    addToast({
      title: 'Lead Removed',
      message: 'Lead removed from active pipeline.',
      type: 'warning'
    });
  }, [addToast]);

  // 8. ADD NEW TEAM MEMBER (User defines name, role, email)
  const addAgent = useCallback((agentData) => {
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
      color: "blue"
    };

    setAgents(prev => [...prev, newAgent]);

    addToast({
      title: 'Team Member Added',
      message: `${newAgent.name} is now available in your team & lead assignment dropdowns.`,
      type: 'success'
    });

    return newAgent;
  }, [agents, addToast]);

  // 9. UPDATE TEAM MEMBER (Rename or edit role/details)
  const updateAgent = useCallback((agentId, updatedData) => {
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
          avatar: updatedData.avatar || agent.avatar
        };
      }
      return agent;
    }));

    // If the name changed, seamlessly update matching assignedTo in customers & assignedAgent in leads
    if (oldName && newName && oldName !== newName) {
      setCustomers(prev => prev.map(c => c.assignedTo === oldName ? { ...c, assignedTo: newName } : c));
      setLeads(prev => prev.map(l => l.assignedAgent === oldName ? { ...l, assignedAgent: newName } : l));
    }

    addToast({
      title: 'Team Member Updated',
      message: `Profile details for ${newName || oldName} have been saved.`,
      type: 'success'
    });
  }, [addToast]);

  // 10. REMOVE TEAM MEMBER
  const removeAgent = useCallback((agentId) => {
    const targetAgent = agents.find(a => a.id === agentId);
    if (!targetAgent) return;

    const agentName = targetAgent.name;

    // Remove from agents
    setAgents(prev => prev.filter(a => a.id !== agentId));

    // Return any assigned customers for this agent back to Unassigned Pool
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

    // Clean up their leads from the active pipeline
    setLeads(prev => prev.filter(l => l.assignedAgent !== agentName));

    addToast({
      title: 'Member Removed from Team',
      message: `${agentName} was removed. Their assigned leads were safely returned to the Unassigned Pool.`,
      type: 'warning'
    });
  }, [agents, addToast]);

  // 5. COMPUTED DASHBOARD & ANALYTICS METRICS (Module 3)
  const analytics = useMemo(() => {
    const totalCustomersPool = customers.length;
    const totalLeadsAssigned = leads.length;
    const unassignedCount = customers.filter(c => !c.isAssigned).length;
    const assignedCustomersCount = customers.filter(c => c.isAssigned).length;

    // Status counts across all assigned leads
    const pendingCount = leads.filter(l => l.status === 'Pending').length;
    const connectedCount = leads.filter(l => l.status === 'Connected').length;
    const interestedCount = leads.filter(l => l.status === 'Interested').length;
    const notInterestedCount = leads.filter(l => l.status === 'Not Interested').length;

    // Conversion / Interest rate
    const interestRate = totalLeadsAssigned > 0 
      ? Math.round((interestedCount / totalLeadsAssigned) * 100) 
      : 0;

    const contactRate = totalLeadsAssigned > 0
      ? Math.round(((totalLeadsAssigned - pendingCount) / totalLeadsAssigned) * 100)
      : 0;

    // Status breakdown percentages
    const statusPercentages = {
      Pending: totalLeadsAssigned > 0 ? Math.round((pendingCount / totalLeadsAssigned) * 100) : 0,
      Connected: totalLeadsAssigned > 0 ? Math.round((connectedCount / totalLeadsAssigned) * 100) : 0,
      Interested: totalLeadsAssigned > 0 ? Math.round((interestedCount / totalLeadsAssigned) * 100) : 0,
      'Not Interested': totalLeadsAssigned > 0 ? Math.round((notInterestedCount / totalLeadsAssigned) * 100) : 0,
    };

    // Agent metrics breakdown
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
    unassignCustomers,
    deleteLead,
    addAgent,
    updateAgent,
    removeAgent,
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
