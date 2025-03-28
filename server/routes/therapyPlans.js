const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const TherapyPlan = require('../models/TherapyPlan');

// Get all therapy plans for a patient
router.get('/', auth, async (req, res) => {
  try {
    const { patient, status } = req.query;
    console.log('User making request:', {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    });
    console.log('Fetching therapy plans with query:', { patient, status });
    
    const query = {};
    
    if (patient) {
      query.patient = patient;
    }
    
    if (status) {
      query.status = status;
    }

    // If user is a supervisor, they can see all pending plans
    // If user is a therapist, they can only see their own plans
    if (req.user.role !== 'supervisor') {
      query.therapist = req.user.id;
    }

    console.log('Final query:', query);
    
    const therapyPlans = await TherapyPlan.find(query)
      .populate('patient', 'name')
      .populate('therapist', 'name')
      .populate('supervisor', 'name')
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log('Found therapy plans:', therapyPlans);
    
    if (!therapyPlans || therapyPlans.length === 0) {
      console.log('No therapy plans found');
      return res.json([]); // Return empty array instead of error
    }
    
    res.json(therapyPlans);
  } catch (err) {
    console.error('Error fetching therapy plans:', err);
    res.status(500).json({ 
      message: 'Error fetching therapy plans',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

// Approve therapy plan
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const therapyPlan = await TherapyPlan.findById(req.params.id);
    
    if (!therapyPlan) {
      return res.status(404).json({ message: 'Therapy plan not found' });
    }

    // Check if user is a supervisor
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ message: 'Only supervisors can approve therapy plans' });
    }

    therapyPlan.status = 'approved';
    therapyPlan.supervisorFeedback = req.body.feedback;
    const updatedTherapyPlan = await therapyPlan.save();
    res.json(updatedTherapyPlan);
  } catch (err) {
    console.error('Error approving therapy plan:', err);
    res.status(500).json({ message: err.message });
  }
});

// Reject therapy plan
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const therapyPlan = await TherapyPlan.findById(req.params.id);
    
    if (!therapyPlan) {
      return res.status(404).json({ message: 'Therapy plan not found' });
    }

    // Check if user is a supervisor
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ message: 'Only supervisors can reject therapy plans' });
    }

    therapyPlan.status = 'rejected';
    therapyPlan.supervisorFeedback = req.body.feedback;
    const updatedTherapyPlan = await therapyPlan.save();
    res.json(updatedTherapyPlan);
  } catch (err) {
    console.error('Error rejecting therapy plan:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 