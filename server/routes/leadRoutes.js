import express from 'express';
import { Lead } from '../models/Lead.js';

const router = express.Router();

// Fallback guard if MONGODB_URI is not yet configured
router.use((req, res, next) => {
  if (!process.env.MONGODB_URI) {
    if (req.method === 'GET') {
      return res.json({ success: true, count: 0, data: [], note: 'MONGODB_URI not configured' });
    }
    return res.json({ success: true, message: 'Local mode active', data: req.body });
  }
  next();
});

// GET all leads
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json({ success: true, count: leads.length, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['Pending', 'Connected', 'Interested', 'Not Interested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status: ${status}` });
    }

    const now = new Date();
    const timestamp = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const updateFields = {
      status,
      ...(status !== 'Pending' ? { lastContactDate: timestamp } : {}),
      ...(notes ? { notes } : {})
    };

    const updated = await Lead.findOneAndUpdate(
      { id },
      { $set: updateFields },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE single lead
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Lead.deleteOne({ id });
    res.json({ success: true, message: `Lead ${id} removed` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
