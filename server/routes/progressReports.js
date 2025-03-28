const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ProgressReport = require('../models/ProgressReport');

// Get all progress reports for a patient
router.get('/', auth, async (req, res) => {
  try {
    const { patient } = req.query;
    const query = { therapist: req.user.id };
    if (patient) {
      query.patient = patient;
    }
    const progressReports = await ProgressReport.find(query)
      .populate('patient', 'name')
      .populate('therapyPlan', 'goals activities');
    res.json(progressReports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single progress report
router.get('/:id', auth, async (req, res) => {
  try {
    const progressReport = await ProgressReport.findOne({
      _id: req.params.id,
      therapist: req.user.id
    })
      .populate('patient', 'name')
      .populate('therapyPlan', 'goals activities');
    
    if (!progressReport) {
      return res.status(404).json({ message: 'Progress report not found' });
    }
    res.json(progressReport);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create progress report
router.post('/', auth, async (req, res) => {
  const progressReport = new ProgressReport({
    ...req.body,
    therapist: req.user.id
  });

  try {
    const newProgressReport = await progressReport.save();
    res.status(201).json(newProgressReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update progress report
router.put('/:id', auth, async (req, res) => {
  try {
    const progressReport = await ProgressReport.findOne({
      _id: req.params.id,
      therapist: req.user.id
    });
    
    if (!progressReport) {
      return res.status(404).json({ message: 'Progress report not found' });
    }

    Object.assign(progressReport, req.body);
    const updatedProgressReport = await progressReport.save();
    res.json(updatedProgressReport);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete progress report
router.delete('/:id', auth, async (req, res) => {
  try {
    const progressReport = await ProgressReport.findOne({
      _id: req.params.id,
      therapist: req.user.id
    });
    
    if (!progressReport) {
      return res.status(404).json({ message: 'Progress report not found' });
    }

    await progressReport.remove();
    res.json({ message: 'Progress report deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 