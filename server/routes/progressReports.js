const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ProgressReport = require('../models/ProgressReport');

// Get all progress reports for a patient
router.get('/', auth, async (req, res) => {
  try {
    const { patient } = req.query;
    const query = {};
    
    console.log('Fetching progress reports for user:', {
      userId: req.user.id,
      role: req.user.role,
      user: req.user
    });
    
    // If user is a supervisor, they can see all reports
    // If user is a therapist, they can only see their own reports
    if (req.user.role !== 'supervisor') {
      query.therapist = req.user.id;
    }
    
    if (patient) {
      query.patient = patient;
    }

    console.log('Query:', query);

    // First check if the user exists
    if (!req.user || !req.user.id) {
      console.error('User not found or invalid:', req.user);
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Try to find reports with proper population
    const progressReports = await ProgressReport.find(query)
      .populate({
        path: 'patient',
        select: 'name age gender contactNumber email status'
      })
      .populate({
        path: 'therapist',
        select: 'name email role'
      })
      .sort({ createdAt: -1 }); // Sort by newest first
    
    console.log('Found reports:', progressReports.length);
    res.json(progressReports);
  } catch (err) {
    console.error('Error fetching progress reports:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code
    });
    
    // Check for specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({ 
        message: 'Invalid ID format',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

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
      .populate({
        path: 'patient',
        select: 'name age gender contactNumber email status'
      })
      .populate({
        path: 'therapist',
        select: 'name email role'
      });
    
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
  try {
    const progressReport = new ProgressReport({
      ...req.body,
      therapist: req.user.id
    });

    const newProgressReport = await progressReport.save();
    res.status(201).json(newProgressReport);
  } catch (err) {
    console.error('Error creating progress report:', err);
    res.status(400).json({ 
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
    console.error('Error updating progress report:', err);
    res.status(400).json({ 
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

    await progressReport.deleteOne();
    res.json({ message: 'Progress report deleted' });
  } catch (err) {
    console.error('Error deleting progress report:', err);
    res.status(500).json({ 
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 