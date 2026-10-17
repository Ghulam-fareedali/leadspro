import express from 'express';
import { Admin } from '../models/Admin.js';

const router = express.Router();

const DEFAULT_ADMIN = {
  email: 'sales@techdeva.net',
  username: 'sales@techdeva.net',
  password: 'Techdeva@12',
  name: 'Sales Administrator',
  role: 'System Administrator'
};

// POST admin login verification against MongoDB
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanId = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanId || !cleanPassword) {
      return res.status(400).json({ success: false, message: 'Please enter your Admin email and password.' });
    }

    let admin = await Admin.findOne();
    if (!admin) {
      admin = await Admin.create(DEFAULT_ADMIN);
    }

    const matchesId = (admin.email && admin.email.toLowerCase() === cleanId) ||
                      (admin.username && admin.username.toLowerCase() === cleanId) ||
                      cleanId === 'sales@techdeva.net';
    const matchesPassword = (admin.password === cleanPassword);

    if (!matchesId || !matchesPassword) {
      return res.status(401).json({ success: false, message: 'Invalid Admin credentials. Access denied.' });
    }

    res.json({
      success: true,
      message: 'Admin authentication successful',
      data: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET admin profile from MongoDB (Password omitted for security)
router.get('/', async (req, res) => {
  try {
    let admin = await Admin.findOne();
    if (!admin) {
      admin = await Admin.create(DEFAULT_ADMIN);
    }

    res.json({
      success: true,
      data: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        avatar: admin.avatar
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      data: {
        email: DEFAULT_ADMIN.email,
        username: DEFAULT_ADMIN.username,
        name: DEFAULT_ADMIN.name,
        role: DEFAULT_ADMIN.role
      }
    });
  }
});

// POST update admin profile in MongoDB
router.post('/', async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const updateFields = {
      ...(name ? { name: name.trim() } : {}),
      ...(email ? { email: email.trim().toLowerCase() } : {}),
      ...(username ? { username: username.trim().toLowerCase() } : {}),
      ...(password ? { password: password.trim() } : {})
    };

    let admin = await Admin.findOneAndUpdate(
      {},
      { $set: updateFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Admin profile updated successfully in MongoDB',
      data: admin
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
