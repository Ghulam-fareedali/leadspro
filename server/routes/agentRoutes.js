import express from 'express';
import { Agent } from '../models/Agent.js';
import { Customer } from '../models/Customer.js';
import { Lead } from '../models/Lead.js';
import { getCloudData, saveCloudData } from '../config/cloudStorage.js';

const router = express.Router();

const isMongoActive = () => Boolean(process.env.MONGODB_URI);

// GET all agents
router.get('/', async (req, res) => {
  try {
    if (isMongoActive()) {
      const agents = await Agent.find().sort({ id: 1 });
      return res.json({ success: true, count: agents.length, data: agents, source: 'mongodb' });
    }

    const cloudData = await getCloudData();
    res.json({
      success: true,
      count: cloudData.agents.length,
      data: cloudData.agents,
      source: 'cloud_sync'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create new agent
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

    if (isMongoActive()) {
      const lastAgent = await Agent.findOne().sort({ id: -1 });
      const nextId = lastAgent ? lastAgent.id + 1 : 1;
      const pickedAvatar = avatar || defaultAvatars[nextId % defaultAvatars.length];

      const newAgent = await Agent.create({
        id: nextId,
        name: name.trim(),
        role: role || 'Sales Representative',
        email: email || '',
        phone: phone || '',
        avatar: pickedAvatar,
        color: color || 'blue',
        pin: pin ? String(pin).trim() : '1234'
      });

      return res.status(201).json({ success: true, data: newAgent });
    }

    const cloudData = await getCloudData();
    const nextId = cloudData.agents.length > 0 ? Math.max(...cloudData.agents.map(a => a.id)) + 1 : 1;
    const pickedAvatar = avatar || defaultAvatars[nextId % defaultAvatars.length];

    const newAgent = {
      id: nextId,
      name: name.trim(),
      role: role || 'Sales Representative',
      email: email || '',
      phone: phone || '',
      avatar: pickedAvatar,
      color: color || 'blue',
      pin: pin ? String(pin).trim() : '1234'
    };

    cloudData.agents.push(newAgent);
    await saveCloudData(cloudData);

    res.status(201).json({ success: true, data: newAgent });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// PUT update agent PIN directly
router.put('/:id/pin', async (req, res) => {
  try {
    const { id } = req.params;
    const { pin } = req.body;

    if (!pin || !String(pin).trim()) {
      return res.status(400).json({ success: false, error: 'PIN is required' });
    }

    const pinStr = String(pin).trim();

    if (isMongoActive()) {
      const updated = await Agent.findOneAndUpdate(
        { id: Number(id) },
        { $set: { pin: pinStr } },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, error: 'Agent not found' });
      return res.json({ success: true, message: `PIN updated to ${pinStr}`, data: updated });
    }

    const cloudData = await getCloudData();
    let found = false;
    cloudData.agents = cloudData.agents.map(a => {
      if (String(a.id) === String(id)) {
        found = true;
        return { ...a, pin: pinStr };
      }
      return a;
    });

    if (!found) return res.status(404).json({ success: false, error: 'Agent not found' });

    await saveCloudData(cloudData);
    res.json({ success: true, message: `PIN updated to ${pinStr}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update agent profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, phone, avatar, pin } = req.body;

    if (isMongoActive()) {
      const updated = await Agent.findOneAndUpdate(
        { id: Number(id) },
        {
          $set: {
            ...(name ? { name: name.trim() } : {}),
            ...(role ? { role: role.trim() } : {}),
            ...(email ? { email: email.trim() } : {}),
            ...(phone ? { phone: phone.trim() } : {}),
            ...(avatar ? { avatar } : {}),
            ...(pin ? { pin: String(pin).trim() } : {})
          }
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ success: false, error: 'Agent not found' });
      return res.json({ success: true, data: updated });
    }

    const cloudData = await getCloudData();
    cloudData.agents = cloudData.agents.map(a => {
      if (String(a.id) === String(id)) {
        return {
          ...a,
          ...(name ? { name: name.trim() } : {}),
          ...(role ? { role: role.trim() } : {}),
          ...(email ? { email: email.trim() } : {}),
          ...(phone ? { phone: phone.trim() } : {}),
          ...(avatar ? { avatar } : {}),
          ...(pin ? { pin: String(pin).trim() } : {})
        };
      }
      return a;
    });

    await saveCloudData(cloudData);
    res.json({ success: true, message: 'Agent updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE agent
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      const agent = await Agent.findOne({ id: Number(id) });
      if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

      await Agent.findOneAndDelete({ id: Number(id) });
      await Customer.updateMany(
        { assignedTo: agent.name },
        { $set: { isAssigned: false, assignedTo: null, assignedAt: null } }
      );
      await Lead.deleteMany({ assignedAgent: agent.name });

      return res.json({ success: true, message: `Agent ${agent.name} deleted` });
    }

    const cloudData = await getCloudData();
    const agent = cloudData.agents.find(a => String(a.id) === String(id));
    if (!agent) return res.status(404).json({ success: false, error: 'Agent not found' });

    cloudData.agents = cloudData.agents.filter(a => String(a.id) !== String(id));
    cloudData.customers = cloudData.customers.map(c => {
      if (c.assignedTo === agent.name) {
        return { ...c, isAssigned: false, assignedTo: null, assignedAt: null };
      }
      return c;
    });
    cloudData.leads = cloudData.leads.filter(l => l.assignedAgent !== agent.name);

    await saveCloudData(cloudData);
    res.json({ success: true, message: `Agent ${agent.name} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
