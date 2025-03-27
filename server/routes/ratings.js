const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ClinicalRating = require('../models/ClinicalRating');

// Get all clinical ratings for a patient
router.get('/', auth, async (req, res) => {
  try {
    const { patient } = req.query;
    const query = { therapist: req.user.id };
    if (patient) {
      query.patient = patient;
    }
    const ratings = await ClinicalRating.find(query)
      .populate('patient', 'name');
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single clinical rating
router.get('/:id', auth, async (req, res) => {
  try {
    const rating = await ClinicalRating.findOne({
      _id: req.params.id,
      therapist: req.user.id
    }).populate('patient', 'name');
    
    if (!rating) {
      return res.status(404).json({ message: 'Clinical rating not found' });
    }
    res.json(rating);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create clinical rating
router.post('/', auth, async (req, res) => {
  const rating = new ClinicalRating({
    ...req.body,
    therapist: req.user.id
  });

  try {
    const newRating = await rating.save();
    res.status(201).json(newRating);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update clinical rating
router.put('/:id', auth, async (req, res) => {
  try {
    const rating = await ClinicalRating.findOne({
      _id: req.params.id,
      therapist: req.user.id
    });
    
    if (!rating) {
      return res.status(404).json({ message: 'Clinical rating not found' });
    }

    Object.assign(rating, req.body);
    const updatedRating = await rating.save();
    res.json(updatedRating);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete clinical rating
router.delete('/:id', auth, async (req, res) => {
  try {
    const rating = await ClinicalRating.findOne({
      _id: req.params.id,
      therapist: req.user.id
    });
    
    if (!rating) {
      return res.status(404).json({ message: 'Clinical rating not found' });
    }

    await rating.remove();
    res.json({ message: 'Clinical rating deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 