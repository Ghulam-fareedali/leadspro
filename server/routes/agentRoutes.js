import express from 'express';
import { Agent } from '../models/Agent.js';
import { Customer } from '../models/Customer.js';
import { Lead } from '../models/Lead.js';

const router = express.Router();

// GET all agents strictly from MongoDB
router.get('/', async (req, res) => {
  try {
    const agents = await Agent.find().sort({ id: 1 });
    res.json({
      success: true,
      count: agents.length,
      data: agents,
      source: 'mongodb'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new agent strictly to MongoDB
router.post('/', async (req, res) => {
  try {
    const { name, role, email, phone, avatar, color, pin } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const defaultAvatars = [
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80"
    ];

    const lastAgent = await Agent.findOne().sort({ id: -1 });
    const nextId = lastAgent ? lastAgent.id + 1 : 1;
    const pickedAvatar = avatar || defaultAvatars[nextId % defaultAvatars.length];

    const newAgent = await Agent.create({
      id: nextId,
      name: name.trim(),
      role: role ? role.trim() : 'Sales Representative',
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '0300-1234567',
      avatar: pickedAvatar,
      color: color || 'blue',
      pin: pin ? String(pin).trim() : '1234'
    });

    res.status(201).json({ success: true, data: newAgent });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update agent PIN strictly in MongoDB
router.put('/:id/pin', async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    if (!pin || !String(pin).trim()) {
      return res.status(400).json({ success: false, error: 'PIN is required' });
    }

    const pinStr = String(pin).trim();

    const updated = await Agent.findOneAndUpdate(
      { id: Number(id) },
      { $set: { pin: pinStr } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Agent not found in MongoDB' });
    }

    res.json({
      success: true,
      message: `PIN updated to ${pinStr} in MongoDB`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update agent profile strictly in MongoDB
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, phone, avatar, pin } = req.body;

    const existingAgent = await Agent.findOne({ id: Number(id) });
    if (!existingAgent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const oldName = existingAgent.name;
    const newName = name ? name.trim() : oldName;

    const updated = await Agent.findOneAndUpdate(
      { id: Number(id) },
      {
        $set: {
          name: newName,
          ...(role ? { role: role.trim() } : {}),
          ...(email ? { email: email.trim() } : {}),
          ...(phone ? { phone: phone.trim() } : {}),
          ...(avatar ? { avatar } : {}),
          ...(pin ? { pin: String(pin).trim() } : {})
        }
      },
      { new: true }
    );

    // If agent name changed, update linked Customers and Leads
    if (oldName !== newName) {
      await Customer.updateMany({ assignedTo: oldName }, { $set: { assignedTo: newName } });
      await Lead.updateMany({ assignedAgent: oldName }, { $set: { assignedAgent: newName } });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE agent strictly in MongoDB (returns assigned customers to pool)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const targetAgent = await Agent.findOne({ id: Number(id) });
    if (!targetAgent) {
      return res.status(404).json({ success: false, error: 'Agent not found' });
    }

    const agentName = targetAgent.name;

    // Delete agent from MongoDB
    await Agent.findOneAndDelete({ id: Number(id) });

    // Unassign customers and remove pipeline leads
    await Customer.updateMany(
      { assignedTo: agentName },
      { $set: { isAssigned: false, assignedTo: null, assignedAt: null } }
    );

    await Lead.deleteMany({ assignedAgent: agentName });

    res.json({
      success: true,
      message: `Agent ${agentName} removed from MongoDB. Assigned leads returned to unassigned pool.`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
