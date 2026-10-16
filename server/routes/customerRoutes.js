import express from 'express';
import { Customer } from '../models/Customer.js';
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

// GET all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST single customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, source, city } = req.body;
    
    // Generate next CUST ID
    const count = await Customer.countDocuments();
    const id = `CUST-${1001 + count}`;

    const newCustomer = await Customer.create({
      id,
      name,
      phone: phone || '0300-0000000',
      email: email || '',
      source: source || 'Direct Entry',
      city: city || 'Karachi',
      importedDate: new Date().toISOString().split('T')[0],
      isAssigned: false,
      assignedTo: null,
      assignedAt: null
    });

    res.status(201).json({ success: true, data: newCustomer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST bulk upload (from Excel)
router.post('/bulk', async (req, res) => {
  try {
    const { records } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, error: 'Records array is required' });
    }

    const currentCount = await Customer.countDocuments();
    let nextNum = 1001 + currentCount;
    const today = new Date().toISOString().split('T')[0];

    const toInsert = records.map(rec => ({
      id: `CUST-${nextNum++}`,
      name: rec.name || 'Unnamed Corporate Account',
      phone: rec.phone || '0300-0000000',
      email: rec.email || '',
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

// POST assign customers to agent -> creates Leads with status "Pending"
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

    // 1. Update customers
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

    // 2. Fetch updated customers to spawn leads
    const assignedCustomers = await Customer.find({ id: { $in: customerIds } });
    const currentLeadCount = await Lead.countDocuments();
    let leadNum = 2001 + currentLeadCount;

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

    await Lead.insertMany(newLeads);

    res.json({
      success: true,
      message: `${customerIds.length} customer(s) assigned to ${agentName}`,
      assignedCount: customerIds.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST unassign customers back to pool
router.post('/unassign', async (req, res) => {
  try {
    const { customerIds } = req.body;
    if (!customerIds || !Array.isArray(customerIds)) {
      return res.status(400).json({ success: false, error: 'customerIds array required' });
    }

    await Customer.updateMany(
      { id: { $in: customerIds } },
      {
        $set: {
          isAssigned: false,
          assignedTo: null,
          assignedAt: null
        }
      }
    );

    await Lead.deleteMany({ customerId: { $in: customerIds } });

    res.json({ success: true, message: `${customerIds.length} customer(s) returned to pool` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE bulk customers (and their linked leads)
router.delete('/bulk', async (req, res) => {
  try {
    const { customerIds, all } = req.body;
    if (all) {
      const deletedCusts = await Customer.deleteMany({});
      const deletedLeads = await Lead.deleteMany({});
      return res.json({ 
        success: true, 
        message: 'All customers and leads deleted from database',
        deletedCustomers: deletedCusts.deletedCount,
        deletedLeads: deletedLeads.deletedCount
      });
    }

    if (!customerIds || !Array.isArray(customerIds)) {
      return res.status(400).json({ success: false, error: 'customerIds array required' });
    }

    await Customer.deleteMany({ id: { $in: customerIds } });
    await Lead.deleteMany({ customerId: { $in: customerIds } });

    res.json({ success: true, message: `Deleted ${customerIds.length} customer(s) and linked leads` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE all customers and leads
router.delete('/all', async (req, res) => {
  try {
    const deletedCusts = await Customer.deleteMany({});
    const deletedLeads = await Lead.deleteMany({});
    res.json({ 
      success: true, 
      message: 'All customers and linked leads completely wiped from database',
      deletedCustomers: deletedCusts.deletedCount,
      deletedLeads: deletedLeads.deletedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE single customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Customer.deleteOne({ id });
    await Lead.deleteMany({ customerId: id });
    res.json({ success: true, message: `Deleted customer ${id} and linked leads` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
