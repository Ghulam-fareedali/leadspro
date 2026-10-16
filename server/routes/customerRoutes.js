import express from 'express';
import { Customer } from '../models/Customer.js';
import { Lead } from '../models/Lead.js';
import { getCloudData, saveCloudData } from '../config/cloudStorage.js';

const router = express.Router();

const isMongoActive = () => Boolean(process.env.MONGODB_URI);

// GET all customers
router.get('/', async (req, res) => {
  try {
    if (isMongoActive()) {
      const customers = await Customer.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: customers.length, data: customers, source: 'mongodb' });
    }

    const cloudData = await getCloudData();
    res.json({
      success: true,
      count: cloudData.customers.length,
      data: cloudData.customers,
      source: 'cloud_sync'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST single customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, source, city } = req.body;
    const today = new Date().toISOString().split('T')[0];

    if (isMongoActive()) {
      const count = await Customer.countDocuments();
      const id = `CUST-${1001 + count}`;
      const newCustomer = await Customer.create({
        id,
        name: name || 'Unnamed Account',
        phone: phone || '0300-0000000',
        email: email || '',
        source: source || 'Direct Entry',
        city: city || 'Karachi',
        importedDate: today,
        isAssigned: false,
        assignedTo: null,
        assignedAt: null
      });
      return res.status(201).json({ success: true, data: newCustomer });
    }

    const cloudData = await getCloudData();
    const id = `CUST-${1001 + cloudData.customers.length}`;
    const newCustomer = {
      id,
      name: name || 'Unnamed Account',
      phone: phone || '0300-0000000',
      email: email || '',
      source: source || 'Direct Entry',
      city: city || 'Karachi',
      importedDate: today,
      isAssigned: false,
      assignedTo: null,
      assignedAt: null
    };

    cloudData.customers.unshift(newCustomer);
    await saveCloudData(cloudData);

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

    const today = new Date().toISOString().split('T')[0];

    if (isMongoActive()) {
      const currentCount = await Customer.countDocuments();
      let nextNum = 1001 + currentCount;
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
      return res.status(201).json({ success: true, count: inserted.length, data: inserted });
    }

    const cloudData = await getCloudData();
    let nextNum = 1001 + cloudData.customers.length;

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

    cloudData.customers = [...toInsert, ...cloudData.customers];
    await saveCloudData(cloudData);

    res.status(201).json({ success: true, count: toInsert.length, data: toInsert });
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

    if (isMongoActive()) {
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
      return res.json({ success: true, message: `${customerIds.length} customer(s) assigned to ${agentName}`, count: customerIds.length });
    }

    const cloudData = await getCloudData();
    let leadNum = 2001 + cloudData.leads.length;
    const createdLeads = [];

    cloudData.customers = cloudData.customers.map(c => {
      if (customerIds.includes(c.id)) {
        const updated = {
          ...c,
          isAssigned: true,
          assignedTo: agentName,
          assignedAt: `${formattedDate} ${formattedTime}`
        };

        createdLeads.push({
          id: `LEAD-${leadNum++}`,
          customerId: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          source: c.source,
          assignedAgent: agentName,
          status: 'Pending',
          notes: `Assigned to ${agentName} on ${formattedDate}.`,
          assignedDate: formattedDate,
          lastContactDate: null
        });

        return updated;
      }
      return c;
    });

    cloudData.leads = [...createdLeads, ...cloudData.leads];
    await saveCloudData(cloudData);

    res.json({ success: true, message: `${customerIds.length} customer(s) assigned to ${agentName}`, count: customerIds.length });
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

    if (isMongoActive()) {
      await Customer.updateMany(
        { id: { $in: customerIds } },
        { $set: { isAssigned: false, assignedTo: null, assignedAt: null } }
      );
      await Lead.deleteMany({ customerId: { $in: customerIds } });
      return res.json({ success: true, message: `${customerIds.length} customer(s) returned to pool` });
    }

    const cloudData = await getCloudData();
    cloudData.customers = cloudData.customers.map(c => {
      if (customerIds.includes(c.id)) {
        return { ...c, isAssigned: false, assignedTo: null, assignedAt: null };
      }
      return c;
    });

    cloudData.leads = cloudData.leads.filter(l => !customerIds.includes(l.customerId));
    await saveCloudData(cloudData);

    res.json({ success: true, message: `${customerIds.length} customer(s) returned to pool` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE bulk customers (or delete all)
router.delete('/bulk', async (req, res) => {
  try {
    const { customerIds, all } = req.body;

    if (isMongoActive()) {
      if (all) {
        await Customer.deleteMany({});
        await Lead.deleteMany({});
        return res.json({ success: true, message: 'All customers and linked leads deleted' });
      }
      await Customer.deleteMany({ id: { $in: customerIds } });
      await Lead.deleteMany({ customerId: { $in: customerIds } });
      return res.json({ success: true, message: 'Selected customers deleted' });
    }

    const cloudData = await getCloudData();
    if (all) {
      cloudData.customers = [];
      cloudData.leads = [];
      await saveCloudData(cloudData);
      return res.json({ success: true, message: 'All customers and linked leads deleted' });
    }

    if (Array.isArray(customerIds)) {
      cloudData.customers = cloudData.customers.filter(c => !customerIds.includes(c.id));
      cloudData.leads = cloudData.leads.filter(l => !customerIds.includes(l.customerId));
      await saveCloudData(cloudData);
      return res.json({ success: true, message: 'Selected customers deleted' });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE single customer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isMongoActive()) {
      await Customer.findOneAndDelete({ id });
      await Lead.deleteMany({ customerId: id });
      return res.json({ success: true, message: `Customer ${id} deleted` });
    }

    const cloudData = await getCloudData();
    cloudData.customers = cloudData.customers.filter(c => c.id !== id);
    cloudData.leads = cloudData.leads.filter(l => l.customerId !== id);
    await saveCloudData(cloudData);

    res.json({ success: true, message: `Customer ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
