import express from 'express';
import { Customer } from '../models/Customer.js';
import { Lead } from '../models/Lead.js';

const router = express.Router();

// GET all customers strictly from MongoDB
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: customers.length,
      data: customers,
      source: 'mongodb'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST single customer strictly to MongoDB
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, source, city } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const count = await Customer.countDocuments();
    const id = `CUST-${1001 + count}`;

    const newCustomer = await Customer.create({
      id,
      name: name ? name.trim() : 'Unnamed Account',
      phone: phone ? phone.trim() : '0300-0000000',
      email: email ? email.trim() : '',
      source: source || 'Direct Entry',
      city: city || 'Karachi',
      importedDate: today,
      isAssigned: false,
      assignedTo: null,
      assignedAt: null
    });

    res.status(201).json({ success: true, data: newCustomer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST bulk upload (from Excel) strictly to MongoDB
router.post('/bulk', async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, error: 'Records array is required' });
    }

    const today = new Date().toISOString().split('T')[0];
    const currentCount = await Customer.countDocuments();
    let nextNum = 1001 + currentCount;

    const toInsert = records.map(rec => ({
      id: `CUST-${nextNum++}`,
      name: rec.name ? rec.name.trim() : 'Unnamed Corporate Account',
      phone: rec.phone ? rec.phone.trim() : '0300-0000000',
      email: rec.email ? rec.email.trim() : '',
      source: rec.source || 'Excel File Upload',
      city: rec.city || 'Karachi',
      importedDate: today,
      isAssigned: false,
      assignedTo: null,
      assignedAt: null
    }));

    const inserted = await Customer.insertMany(toInsert);
    res.status(201).json({ success: true, count: inserted.length, data: inserted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST assign customers to agent -> updates Customers and creates Leads in MongoDB
router.post('/assign', async (req, res) => {
  try {
    const { customerIds, agentName } = req.body;
    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return res.status(400).json({ success: false, error: 'customerIds array is required' });
    }
    if (!agentName) {
      return res.status(400).json({ success: false, error: 'agentName is required' });
    }

    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Update Customers in MongoDB
    await Customer.updateMany(
      { id: { $in: customerIds } },
      {
        $set: {
          isAssigned: true,
          assignedTo: agentName,
          assignedAt: `${formattedDate} ${formattedTime}`
        }
      }
    );

    // 2. Query updated customer records
    const assignedCustomers = await Customer.find({ id: { $in: customerIds } });
    const currentLeadCount = await Lead.countDocuments();
    let leadNum = 2001 + currentLeadCount;

    // 3. Create linked Leads in MongoDB
    const newLeads = assignedCustomers.map(cust => ({
      id: `LEAD-${leadNum++}`,
      customerId: cust.id,
      name: cust.name,
      phone: cust.phone,
      email: cust.email,
      source: cust.source,
      assignedAgent: agentName,
      status: 'Pending',
      notes: `Assigned to ${agentName} on ${formattedDate}.`,
      assignedDate: formattedDate,
      lastContactDate: null
    }));

    const insertedLeads = await Lead.insertMany(newLeads);

    res.json({
      success: true,
      message: `${customerIds.length} customer(s) assigned to ${agentName}`,
      count: customerIds.length,
      leads: insertedLeads
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST unassign customers back to raw pool in MongoDB
router.post('/unassign', async (req, res) => {
  try {
    const { customerIds } = req.body;
    if (!customerIds || !Array.isArray(customerIds)) {
      return res.status(400).json({ success: false, error: 'customerIds array required' });
    }

    await Customer.updateMany(
      { id: { $in: customerIds } },
      { $set: { isAssigned: false, assignedTo: null, assignedAt: null } }
    );

    await Lead.deleteMany({ customerId: { $in: customerIds } });

    res.json({ success: true, message: `${customerIds.length} customer(s) returned to pool` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE bulk customers (or delete all) strictly in MongoDB
router.delete('/bulk', async (req, res) => {
  try {
    const { customerIds, all } = req.body;

    if (all) {
      await Customer.deleteMany({});
      await Lead.deleteMany({});
      return res.json({ success: true, message: 'All customers and linked leads deleted from MongoDB' });
    }

    if (Array.isArray(customerIds) && customerIds.length > 0) {
      await Customer.deleteMany({ id: { $in: customerIds } });
      await Lead.deleteMany({ customerId: { $in: customerIds } });
      return res.json({ success: true, message: 'Selected customers deleted from MongoDB' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE all customers and leads
router.delete('/all', async (req, res) => {
  try {
    await Customer.deleteMany({});
    await Lead.deleteMany({});
    res.json({ success: true, message: 'All customers and linked leads cleared from MongoDB' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE single customer strictly from MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Customer.findOneAndDelete({ id });
    await Lead.deleteMany({ customerId: id });
    res.json({ success: true, message: `Customer ${id} and linked leads deleted from MongoDB` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
