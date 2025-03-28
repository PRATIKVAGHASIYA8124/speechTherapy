const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Patient = require('../models/Patient');

// Get all patients
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    // If user is a therapist, only show their patients
    if (req.user.role === 'therapist') {
      query.therapist = req.user.id;
    }
    const patients = await Patient.find(query)
      .populate('therapist', 'name')
      .sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({ message: err.message });
  }
});

// Get single patient
router.get('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    // If user is a therapist, only allow access to their patients
    if (req.user.role === 'therapist') {
      query.therapist = req.user.id;
    }
    
    const patient = await Patient.findOne(query).populate('therapist', 'name');
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create patient
router.post('/', auth, async (req, res) => {
  const patient = new Patient({
    ...req.body,
    therapist: req.user.id
  });

  try {
    const newPatient = await patient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update patient
router.put('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    // If user is a therapist, only allow access to their patients
    if (req.user.role === 'therapist') {
      query.therapist = req.user.id;
    }

    const patient = await Patient.findOne(query);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    Object.assign(patient, req.body);
    const updatedPatient = await patient.save();
    res.json(updatedPatient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete patient
router.delete('/:id', auth, async (req, res) => {
  try {
    let query = { _id: req.params.id };
    // If user is a therapist, only allow access to their patients
    if (req.user.role === 'therapist') {
      query.therapist = req.user.id;
    }

    const patient = await Patient.findOneAndDelete(query);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 