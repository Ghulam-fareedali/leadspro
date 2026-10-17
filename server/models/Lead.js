import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    default: '0300-0000000'
  },
  email: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'Excel Bulk Import'
  },
  assignedAgent: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Connected', 'Interested', 'Not Interested', 'Not on WhatsApp'],
    default: 'Pending',
    index: true
  },
  notes: {
    type: String,
    default: 'Assigned from Customer pool.'
  },
  assignedDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  lastContactDate: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
export default Lead;
