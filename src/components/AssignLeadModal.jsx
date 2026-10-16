import React, { useState } from 'react';
import { useLead } from '../context/LeadContext';
import { X, UserPlus, Phone, Mail, Building, DollarSign, UserCheck, AlertCircle } from 'lucide-react';

export const AssignLeadModal = ({ isOpen, onClose }) => {
  const { users, assignNewLead } = useLead();

  const agents = users.filter(u => u.role === 'Agent');

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    assignedTo: agents[0]?.name || 'Bilal',
    priority: 'Medium',
    dealValue: '12000',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Lead / Company name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!formData.assignedTo) errs.assignedTo = 'Please select an agent';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    assignNewLead(formData);

    // Reset and close
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      assignedTo: agents[0]?.name || 'Bilal',
      priority: 'Medium',
      dealValue: '12000',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Assign New Lead</h3>
              <p className="text-xs text-slate-500">Route a new lead directly to an active sales agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Company / Lead Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lead / Company Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apex Global Logistics"
                className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? 'border-rose-300 ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 ring-blue-500/20 focus:border-blue-600'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Contact Person & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="e.g. Salman Ahmed"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0300-1234567"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
                      ? 'border-rose-300 ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Email & Agent Assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.com"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.email
                      ? 'border-rose-300 ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200 ring-blue-500/20 focus:border-blue-600'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign to Agent <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800"
                >
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.name}>
                      {agent.name} ({agent.title})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Priority & Deal Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-600 transition-all"
              >
                <option value="High">🔥 High Priority</option>
                <option value="Medium">⚡ Medium Priority</option>
                <option value="Low">💤 Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Deal Value ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={formData.dealValue}
                  onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                  placeholder="10000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Initial Instructions or Context
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Inbound inquiry from conference. Wants demo on Friday."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30 transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Assign Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
