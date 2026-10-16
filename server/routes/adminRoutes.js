import express from 'express';
import { getCloudData, saveCloudData } from '../config/cloudStorage.js';

const router = express.Router();

const DEFAULT_ADMIN = {
  email: 'admin@leadspro.com',
  username: 'admin',
  password: 'admin',
  name: 'Admin'
};

// GET admin profile
router.get('/', async (req, res) => {
  try {
    const cloudData = await getCloudData();
    const admin = cloudData.admin || DEFAULT_ADMIN;
    res.json({
      success: true,
      data: {
        email: admin.email || 'admin@leadspro.com',
        username: admin.username || 'admin',
        name: admin.name || 'Admin',
        password: admin.password || 'admin'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, data: DEFAULT_ADMIN });
  }
});

// POST update admin profile
router.post('/', async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const cloudData = await getCloudData();

    cloudData.admin = {
      name: name?.trim() || cloudData.admin?.name || 'Admin',
      email: email?.trim() || cloudData.admin?.email || 'admin@leadspro.com',
      username: username?.trim() || cloudData.admin?.username || 'admin',
      password: password?.trim() || cloudData.admin?.password || 'admin',
      updatedAt: new Date().toISOString()
    };

    await saveCloudData(cloudData);

    res.json({ success: true, message: 'Admin profile updated', data: cloudData.admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
