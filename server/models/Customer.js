import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
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
  category: {
    type: String,
    default: 'General Business',
    trim: true,
    index: true
  },
  city: {
    type: String,
    default: 'Karachi'
  },
  importedDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  isAssigned: {
    type: Boolean,
    default: false,
    index: true
  },
  assignedTo: {
    type: String,
    default: null
  },
  assignedAt: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export default Customer;
