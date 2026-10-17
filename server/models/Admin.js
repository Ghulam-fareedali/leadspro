import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    default: 'admin',
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    default: 'admin@leadspro.com',
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    default: 'admin'
  },
  name: {
    type: String,
    default: 'Admin',
    trim: true
  },
  role: {
    type: String,
    default: 'System Administrator'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  }
}, {
  timestamps: true
});

export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default Admin;
