import express from 'express';
import { Customer } from '../models/Customer.js';
import { Lead } from '../models/Lead.js';
import { Agent } from '../models/Agent.js';

const router = express.Router();

// GET aggregated stats strictly from MongoDB collections
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

    const contactRate = totalLeadsAssigned > 0
      ? Math.round(((totalLeadsAssigned - pendingCount) / totalLeadsAssigned) * 100)
      : 0;

    // Real Agent pipeline breakdown from MongoDB
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
      source: 'mongodb',
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
        contactRate,
        agentBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
