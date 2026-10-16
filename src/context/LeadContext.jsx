import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { INITIAL_USERS, INITIAL_LEADS, INITIAL_ACTIVITIES, STATUS_CONFIG } from '../data/mockData';

const LeadContext = createContext(null);

export const LeadProvider = ({ children }) => {
  const [users] = useState(INITIAL_USERS);
  // Default to Ali (Admin)
  const [currentUserId, setCurrentUserId] = useState(1);
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'leads', 'team', 'analytics'

  // Current active user object
  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  const activeRole = currentUser.role;

  // Toast dispatchers
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Switch role / user
  const switchUser = useCallback((userId) => {
    const targetUser = users.find(u => u.id === Number(userId));
    if (targetUser) {
      setCurrentUserId(targetUser.id);
      addToast({
        title: `Switched View`,
        message: `Now viewing as ${targetUser.name} (${targetUser.role} View)`,
        type: 'info'
      });
    }
  }, [users, addToast]);

  const toggleRole = useCallback((newRole) => {
    if (newRole === 'Admin') {
      const admin = users.find(u => u.role === 'Admin');
      if (admin) switchUser(admin.id);
    } else {
      // Pick first agent or current if already agent
      const agent = users.find(u => u.role === 'Agent');
      if (agent) switchUser(agent.id);
    }
  }, [users, switchUser]);

  // Action: Add new lead
  const assignNewLead = useCallback((newLeadData) => {
    const newId = leads.length > 0 ? Math.max(...leads.map(l => l.id)) + 1 : 101;
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];

    const newLead = {
      id: newId,
      name: newLeadData.name.trim(),
      contactPerson: newLeadData.contactPerson?.trim() || newLeadData.name.trim(),
      phone: newLeadData.phone.trim(),
      email: newLeadData.email.trim(),
      assignedTo: newLeadData.assignedTo,
      status: 'Pending',
      priority: newLeadData.priority || 'Medium',
      dealValue: Number(newLeadData.dealValue) || 10000,
      addedDate: formattedDate,
      notes: newLeadData.notes || 'Newly assigned lead from Admin.',
      callHistory: []
    };

    setLeads(prev => [newLead, ...prev]);

    // Add activity
    const newActivity = {
      id: Date.now(),
      user: currentUser.name,
      action: `assigned new lead "${newLead.name}" to`,
      target: newLead.assignedTo,
      time: 'Just now',
      type: 'lead_assigned'
    };
    setActivities(prev => [newActivity, ...prev]);

    addToast({
      title: 'Lead Assigned Successfully',
      message: `${newLead.name} was assigned to ${newLead.assignedTo}.`,
      type: 'success'
    });

    return newLead;
  }, [leads, currentUser, addToast]);

  // Action: Update lead status
  const updateLeadStatus = useCallback((leadId, newStatus, callOutcomeNote = '') => {
    let targetLeadName = '';
    let oldStatus = '';

    setLeads(prevLeads => {
      return prevLeads.map(lead => {
        if (lead.id === leadId) {
          targetLeadName = lead.name;
          oldStatus = lead.status;
          
          const updatedCallHistory = [...lead.callHistory];
          if (newStatus !== 'Pending' && oldStatus === 'Pending') {
            updatedCallHistory.unshift({
              date: new Date().toLocaleString(),
              agent: currentUser.name,
              duration: 'Simulated Call (2m 15s)',
              outcome: callOutcomeNote || `Status changed to ${newStatus}`
            });
          }

          return {
            ...lead,
            status: newStatus,
            notes: callOutcomeNote ? `${callOutcomeNote} (Updated by ${currentUser.name})` : lead.notes,
            callHistory: updatedCallHistory
          };
        }
        return lead;
      });
    });

    // Record activity
    const newActivity = {
      id: Date.now(),
      user: currentUser.name,
      action: `updated status of "${targetLeadName}" to`,
      target: newStatus,
      time: 'Just now',
      type: 'status_change',
      status: newStatus
    };
    setActivities(prev => [newActivity, ...prev]);

    addToast({
      title: `Status Updated`,
      message: `${targetLeadName} marked as "${newStatus}"`,
      type: newStatus === 'Converted' ? 'success' : newStatus === 'Dead' ? 'warning' : 'info'
    });
  }, [currentUser, addToast]);

  // Action: Quick Call simulation
  const recordCallSimulation = useCallback((leadId, durationSeconds, notes, newStatus) => {
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const formattedDuration = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

    let leadName = '';

    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        leadName = lead.name;
        const callEntry = {
          date: new Date().toLocaleString(),
          agent: currentUser.name,
          duration: formattedDuration,
          outcome: notes || `Call completed with status: ${newStatus || 'Call Done'}`
        };

        return {
          ...lead,
          status: newStatus || (lead.status === 'Pending' ? 'Call Done' : lead.status),
          notes: notes ? `${notes} (Call by ${currentUser.name})` : lead.notes,
          callHistory: [callEntry, ...lead.callHistory]
        };
      }
      return lead;
    }));

    addToast({
      title: 'Call Recorded',
      message: `Completed call (${formattedDuration}) with ${leadName}.`,
      type: 'success'
    });
  }, [currentUser, addToast]);

  // Action: Reassign lead
  const reassignLead = useCallback((leadId, newAgentName) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, assignedTo: newAgentName };
      }
      return lead;
    }));

    addToast({
      title: 'Lead Reassigned',
      message: `Assigned to ${newAgentName}.`,
      type: 'info'
    });
  }, [addToast]);

  // Action: Update Notes
  const updateLeadNotes = useCallback((leadId, notes) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return { ...lead, notes };
      }
      return lead;
    }));

    addToast({
      title: 'Notes Saved',
      message: 'Lead notes updated.',
      type: 'success'
    });
  }, [addToast]);

  // Computed: Global Admin KPIs
  const adminKPIs = useMemo(() => {
    const totalLeads = leads.length;
    const totalCallsDone = leads.filter(l => l.status !== 'Pending').length;
    const pendingLeads = leads.filter(l => l.status === 'Pending').length;
    const convertedLeads = leads.filter(l => l.status === 'Converted').length;
    const followUpLeads = leads.filter(l => l.status === 'Follow-up').length;
    const deadLeads = leads.filter(l => l.status === 'Dead').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    const totalPipelineValue = leads.reduce((sum, l) => sum + (l.dealValue || 0), 0);

    return {
      totalLeads,
      totalCallsDone,
      pendingLeads,
      convertedLeads,
      followUpLeads,
      deadLeads,
      conversionRate,
      totalPipelineValue
    };
  }, [leads]);

  // Computed: Team Performance for Admin Table
  const teamPerformance = useMemo(() => {
    const agents = users.filter(u => u.role === 'Agent');
    return agents.map(agent => {
      const agentLeads = leads.filter(l => l.assignedTo === agent.name);
      const totalAssigned = agentLeads.length;
      const callsCompleted = agentLeads.filter(l => l.status !== 'Pending').length;
      const pendingCalls = agentLeads.filter(l => l.status === 'Pending').length;
      const converted = agentLeads.filter(l => l.status === 'Converted').length;
      const completionRate = totalAssigned > 0 ? Math.round((callsCompleted / totalAssigned) * 100) : 0;
      const conversionRate = callsCompleted > 0 ? Math.round((converted / callsCompleted) * 100) : 0;

      return {
        ...agent,
        totalAssigned,
        callsCompleted,
        pendingCalls,
        converted,
        completionRate,
        conversionRate
      };
    });
  }, [users, leads]);

  // Computed: Agent Personal KPIs (filtered for current agent)
  const agentKPIs = useMemo(() => {
    const agentLeads = leads.filter(l => l.assignedTo === currentUser.name);
    const myTarget = agentLeads.length;
    // Calls Made: Leads they have updated (status NOT Pending)
    const callsMade = agentLeads.filter(l => l.status !== 'Pending').length;
    // Calls Left: Their remaining "Pending" leads
    const callsLeft = agentLeads.filter(l => l.status === 'Pending').length;
    const converted = agentLeads.filter(l => l.status === 'Converted').length;
    const followUps = agentLeads.filter(l => l.status === 'Follow-up').length;
    const completionPct = myTarget > 0 ? Math.round((callsMade / myTarget) * 100) : 0;

    return {
      myTarget,
      callsMade,
      callsLeft,
      converted,
      followUps,
      completionPct,
      agentLeads
    };
  }, [leads, currentUser]);

  const value = {
    users,
    currentUser,
    currentUserId,
    activeRole,
    leads,
    activities,
    toasts,
    activeTab,
    setActiveTab,
    switchUser,
    toggleRole,
    assignNewLead,
    updateLeadStatus,
    updateLeadNotes,
    reassignLead,
    recordCallSimulation,
    addToast,
    removeToast,
    adminKPIs,
    teamPerformance,
    agentKPIs,
    statusConfig: STATUS_CONFIG
  };

  return (
    <LeadContext.Provider value={value}>
      {children}
    </LeadContext.Provider>
  );
};

export const useLead = () => {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLead must be used within a LeadProvider');
  }
  return context;
};
