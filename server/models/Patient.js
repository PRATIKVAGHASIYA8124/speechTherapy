const mongoose = require('mongoose');

// Address Schema
const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String },
  country: { type: String }
}, { _id: false });

// Patient Schema
const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
  contactNumber: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: addressSchema, required: true },
  medicalHistory: { type: String, required: true },
  diagnosis: { type: String, required: true },
  status: { type: String, enum: ['active', 'completed', 'discontinued'], default: 'active' },
  totalSessions: { type: Number, default: 0 },
  lastSessionDate: { type: Date },
  therapist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);