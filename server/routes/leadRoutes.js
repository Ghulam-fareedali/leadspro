import express from 'express';
import { Lead } from '../models/Lead.js';
import { getCloudData, saveCloudData } from '../config/cloudStorage.js';

const router = express.Router();

const isMongoActive = () => Boolean(process.env.MONGODB_URI);

// GET all leads
router.get('/', async (req, res) => {
  try {
    if (isMongoActive()) {
      const leads = await Lead.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: leads.length, data: leads, source: 'mongodb' });
    }

    const cloudData = await getCloudData();
    res.json({
      success: true,
      count: cloudData.leads.length,
      data: cloudData.leads,
      source: 'cloud_sync'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update lead status
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

    if (isMongoActive()) {
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

      if (!updated) return res.status(404).json({ success: false, error: 'Lead not found' });
      return res.json({ success: true, data: updated });
    }

    const cloudData = await getCloudData();
    let found = false;

    cloudData.leads = cloudData.leads.map(lead => {
      if (lead.id === id) {
        found = true;
        return {
          ...lead,
          status,
          ...(status !== 'Pending' ? { lastContactDate: timestamp } : {}),
          ...(notes ? { notes } : {})
        };
      }
      return lead;
    });

    if (!found) return res.status(404).json({ success: false, error: 'Lead not found' });

    await saveCloudData(cloudData);
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE single lead
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      await Lead.findOneAndDelete({ id });
      return res.json({ success: true, message: 'Lead deleted' });
    }

    const cloudData = await getCloudData();
    cloudData.leads = cloudData.leads.filter(l => l.id !== id);
    await saveCloudData(cloudData);

    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
