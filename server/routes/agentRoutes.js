import express from 'express';
import { Agent } from '../models/Agent.js';
import { Customer } from '../models/Customer.js';
import { Lead } from '../models/Lead.js';

const router = express.Router();

// GET all agents
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().sort({ id: 1 });
    res.json({ success: true, count: agents.length, data: agents });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new agent
router.post('/', async (req, res) => {
  try {
    const { name, role, email, phone, avatar, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const lastAgent = await Agent.findOne().sort({ id: -1 });
    const nextId = lastAgent ? lastAgent.id + 1 : 1;

    const newAgent = await Agent.create({
      id: nextId,
      name: name.trim(),
      role: role || 'Sales Representative',
      email: email || '',
      phone: phone || '0300-1234567',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      color: color || 'blue'
    });

    res.status(201).json({ success: true, data: newAgent });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update agent (and sync customer / lead references)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, phone, avatar } = req.body;

    const existing = await Agent.findOne({ id: Number(id) });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const oldName = existing.name;
    const newName = name?.trim() || oldName;

    existing.name = newName;
    if (role) existing.role = role;
    if (email) existing.email = email;
    if (phone) existing.phone = phone;
    if (avatar) existing.avatar = avatar;

    await existing.save();

    // Sync name in customers & leads if changed
    if (oldName !== newName) {
      await Customer.updateMany({ assignedTo: oldName }, { $set: { assignedTo: newName } });
      await Lead.updateMany({ assignedAgent: oldName }, { $set: { assignedAgent: newName } });
    }

    res.json({ success: true, data: existing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE remove agent (and return assigned leads back to pool)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await Agent.findOne({ id: Number(id) });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const agentName = existing.name;

    // Return customers to unassigned pool
    await Customer.updateMany(
      { assignedTo: agentName },
      { $set: { isAssigned: false, assignedTo: null, assignedAt: null } }
    );

    // Delete their leads
    await Lead.deleteMany({ assignedAgent: agentName });

    // Remove agent
    await Agent.deleteOne({ id: Number(id) });

    res.json({ success: true, message: `Removed agent ${agentName} and returned leads to pool` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
