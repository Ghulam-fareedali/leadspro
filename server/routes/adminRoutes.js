import express from 'express';
import { Admin } from '../models/Admin.js';

const router = express.Router();

const DEFAULT_ADMIN = {
  email: 'admin@leadspro.com',
  username: 'admin',
  password: 'admin',
  name: 'Admin',
  role: 'System Administrator'
};

// GET admin profile from MongoDB
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
        password: admin.password,
        avatar: admin.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, data: DEFAULT_ADMIN });
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
