const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ProgressReport = require('../models/ProgressReport');

// Get all progress reports for a patient
router.get('/', auth, async (req, res) => {
  try {
    const { patient } = req.query;
    const query = {};
    
    // If user is a supervisor, they can see all reports
    // If user is a therapist, they can only see their own reports
    if (req.user.role !== 'supervisor') {
      query.therapist = req.user.id;
    }
    
    if (patient) {
      query.patient = patient;
    }

    console.log('Fetching progress reports with query:', query);
    
    const progressReports = await ProgressReport.find(query)
      .populate('patient', 'name')
      .populate('therapyPlan', 'goals activities')
      .populate('therapist', 'name')
      .sort({ createdAt: -1 }); // Sort by newest first
      
    console.log('Found progress reports:', progressReports);
    
    res.json(progressReports);
  } catch (err) {
    console.error('Error fetching progress reports:', err);
    res.status(500).json({ 
      message: 'Error fetching progress reports',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get single progress report
router.get('/:id', auth, async (req, res) => {
  try {
    const query = { _id: req.params.id };
    
    // If user is not a supervisor, they can only see their own reports
    if (req.user.role !== 'supervisor') {
      query.therapist = req.user.id;
    }

    const progressReport = await ProgressReport.findOne(query)
      .populate('patient', 'name')
      .populate('therapyPlan', 'goals activities')
      .populate('therapist', 'name');
    
    if (!progressReport) {
      return res.status(404).json({ message: 'Progress report not found' });
    }
    res.json(progressReport);
  } catch (err) {
    console.error('Error fetching progress report:', err);
    res.status(500).json({ 
      message: 'Error fetching progress report',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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