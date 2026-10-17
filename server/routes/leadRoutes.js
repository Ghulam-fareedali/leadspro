import express from 'express';
import { Lead } from '../models/Lead.js';

const router = express.Router();

// GET all leads strictly from MongoDB
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: leads.length,
      data: leads,
      source: 'mongodb'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update lead status strictly in MongoDB
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
      return res.status(404).json({ success: false, error: 'Lead not found in MongoDB' });
    }

    res.json({ success: true, message: 'Status updated in MongoDB', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE single lead strictly from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Lead.findOneAndDelete({ id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    res.json({ success: true, message: `Lead ${id} deleted from MongoDB` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE all leads strictly from MongoDB
router.delete('/', async (req, res) => {
  try {
    await Lead.deleteMany({});
    res.json({ success: true, message: 'All leads deleted from MongoDB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
