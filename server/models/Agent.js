import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    default: 'Sales Representative'
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: '0300-1234567'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  color: {
    type: String,
    default: 'blue'
  }
}, {
  timestamps: true
});

export const Agent = mongoose.models.Agent || mongoose.model('Agent', agentSchema);
export default Agent;
