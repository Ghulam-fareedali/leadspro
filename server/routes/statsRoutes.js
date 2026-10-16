import express from 'express';
import { Customer } from '../models/Customer.js';
import { Lead } from '../models/Lead.js';
import { Agent } from '../models/Agent.js';
import { INITIAL_AGENTS, INITIAL_CUSTOMERS, INITIAL_LEADS } from '../../src/data/customerData.js';

const router = express.Router();

// Fallback guard if MONGODB_URI is not yet configured
router.use((req, res, next) => {
  if (!process.env.MONGODB_URI) {
    return res.json({ 
      success: true, 
      data: {
        totalCustomersPool: 0,
        totalLeadsAssigned: 0,
        unassignedCount: 0,
        assignedCustomersCount: 0,
        pendingCount: 0,
        connectedCount: 0,
        interestedCount: 0,
        notInterestedCount: 0,
        interestRate: 0,
        agentBreakdown: []
      },
      note: 'MONGODB_URI not configured'
    });
  }
  next();
});

// GET aggregated stats for dashboard
router.get('/', async (req, res) => {
  try {
    const totalCustomersPool = await Customer.countDocuments();
    const totalLeadsAssigned = await Lead.countDocuments();
    const unassignedCount = await Customer.countDocuments({ isAssigned: false });
    const assignedCustomersCount = await Customer.countDocuments({ isAssigned: true });

    const pendingCount = await Lead.countDocuments({ status: 'Pending' });
    const connectedCount = await Lead.countDocuments({ status: 'Connected' });
    const interestedCount = await Lead.countDocuments({ status: 'Interested' });
    const notInterestedCount = await Lead.countDocuments({ status: 'Not Interested' });

    const interestRate = totalLeadsAssigned > 0
      ? Math.round((interestedCount / totalLeadsAssigned) * 100)
      : 0;

    // Agent breakdown
    const agents = await Agent.find().sort({ id: 1 });
    const agentBreakdown = await Promise.all(
      agents.map(async (agent) => {
        const total = await Lead.countDocuments({ assignedAgent: agent.name });
        const pending = await Lead.countDocuments({ assignedAgent: agent.name, status: 'Pending' });
        const connected = await Lead.countDocuments({ assignedAgent: agent.name, status: 'Connected' });
        const interested = await Lead.countDocuments({ assignedAgent: agent.name, status: 'Interested' });
        const notInterested = await Lead.countDocuments({ assignedAgent: agent.name, status: 'Not Interested' });
        const conversionRate = total > 0 ? Math.round((interested / total) * 100) : 0;

        return {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          email: agent.email,
          phone: agent.phone,
          avatar: agent.avatar,
          totalLeads: total,
          pending,
          connected,
          interested,
          notInterested,
          conversionRate
        };
      })
    );

    res.json({
      success: true,
      data: {
        totalCustomersPool,
        totalLeadsAssigned,
        unassignedCount,
        assignedCustomersCount,
        pendingCount,
        connectedCount,
        interestedCount,
        notInterestedCount,
        interestRate,
        agentBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST seed initial data if collections are empty
router.post('/seed', async (req, res) => {
  try {
    const agentCount = await Agent.countDocuments();
    if (agentCount === 0) {
      await Agent.insertMany(INITIAL_AGENTS);
    }

    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      await Customer.insertMany(INITIAL_CUSTOMERS);
    }

    const leadCount = await Lead.countDocuments();
    if (leadCount === 0) {
      await Lead.insertMany(INITIAL_LEADS);
    }

    res.json({
      success: true,
      message: 'Initial CRM data seeded successfully',
      seeded: { agents: agentCount === 0, customers: customerCount === 0, leads: leadCount === 0 }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
