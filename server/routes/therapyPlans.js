const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const TherapyPlan = require('../models/TherapyPlan');

// Get all therapy plans for a patient
router.get('/', auth, async (req, res) => {
  try {
    const { patient } = req.query;
    const query = { therapist: req.user.id };
    if (patient) {
      query.patient = patient;
    }
    const therapyPlans = await TherapyPlan.find(query).populate('patient', 'name');
    res.json(therapyPlans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single therapy plan
router.get('/:id', auth, async (req, res) => {
  try {
    const therapyPlan = await TherapyPlan.findOne({
      _id: req.params.id,
      therapist: req.user.id
    }).populate('patient', 'name');
    
    if (!therapyPlan) {
      return res.status(404).json({ message: 'Therapy plan not found' });
    }
    res.json(therapyPlan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create therapy plan
router.post('/', auth, async (req, res) => {
  const therapyPlan = new TherapyPlan({
    ...req.body,
    therapist: req.user.id
  });

  try {
    const newTherapyPlan = await therapyPlan.save();
    res.status(201).json(newTherapyPlan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update therapy plan
router.put('/:id', auth, async (req, res) => {
  try {
    const therapyPlan = await TherapyPlan.findOne({
      _id: req.params.id,
      therapist: req.user.id
    });
    
    if (!therapyPlan) {
      return res.status(404).json({ message: 'Therapy plan not found' });
    }

    Object.assign(therapyPlan, req.body);
    const updatedTherapyPlan = await therapyPlan.save();
    res.json(updatedTherapyPlan);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete therapy plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const therapyPlan = await TherapyPlan.findOne({
      _id: req.params.id,
      therapist: req.user.id
    });
    
    if (!therapyPlan) {
      return res.status(404).json({ message: 'Therapy plan not found' });
    }

    await therapyPlan.remove();
    res.json({ message: 'Therapy plan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 