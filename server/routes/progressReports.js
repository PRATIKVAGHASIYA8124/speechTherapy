const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ProgressReport = require('../models/ProgressReport');
const mongoose = require('mongoose');

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
      query.therapist = req.user.id || req.user._id;
    }
    
    if (patient) {
      query.patient = patient;
    }

    console.log('Query:', query);

    // First check if the user exists
    if (!req.user || (!req.user.id && !req.user._id)) {
      console.error('User not found or invalid:', req.user);
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Try to find reports with proper population
    const progressReports = await ProgressReport.find(query)
      .populate({
        path: 'patient',
        select: 'name age gender contactNumber email status',
        model: 'Patient'
      })
      .populate({
        path: 'therapist',
        select: 'name email role',
        model: 'User'
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
      query.therapist = req.user.id || req.user._id;
    }

    console.log('Fetching progress report with query:', query);

    const progressReport = await ProgressReport.findOne(query)
      .populate({
        path: 'patient',
        select: 'name age gender contactNumber email status',
        model: 'Patient'
      })
      .populate({
        path: 'therapist',
        select: 'name email role',
        model: 'User'
      });
    
    if (!progressReport) {
      console.log('Progress report not found for query:', query);
      return res.status(404).json({ message: 'Progress report not found' });
    }

    console.log('Found progress report:', progressReport);
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
    console.log('Creating progress report with data:', {
      body: req.body,
      therapist: req.user.id || req.user._id
    });

    // Validate patient exists
    const patient = await mongoose.model('Patient').findById(req.body.patient);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    const progressReport = new ProgressReport({
      ...req.body,
      therapist: req.user.id || req.user._id
    });

    const newProgressReport = await progressReport.save();
    
    // Populate the response with patient and therapist data
    const populatedReport = await ProgressReport.findById(newProgressReport._id)
      .populate({
        path: 'patient',
        select: 'name age gender contactNumber email status',
        model: 'Patient'
      })
      .populate({
        path: 'therapist',
        select: 'name email role',
        model: 'User'
      });

    console.log('Created progress report:', populatedReport);
    res.status(201).json(populatedReport);
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

// Approve progress report
router.put('/:id/approve', auth, async (req, res) => {
  try {
    const progressReport = await ProgressReport.findById(req.params.id);
    
    if (!progressReport) {
      return res.status(404).json({ message: 'Progress report not found' });
    }

    // Check if user is a supervisor
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ message: 'Only supervisors can approve progress reports' });
    }

    progressReport.status = 'approved';
    progressReport.supervisorFeedback = req.body.feedback;
    const updatedProgressReport = await progressReport.save();
    
    // Populate the response
    const populatedReport = await ProgressReport.findById(updatedProgressReport._id)
      .populate({
        path: 'patient',
        select: 'name age gender contactNumber email status',
        model: 'Patient'
      })
      .populate({
        path: 'therapist',
        select: 'name email role',
        model: 'User'
      });
    
    res.json(populatedReport);
  } catch (err) {
    console.error('Error approving progress report:', err);
    res.status(500).json({ 
      message: 'Error approving progress report',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Reject progress report
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const progressReport = await ProgressReport.findById(req.params.id);
    
    if (!progressReport) {
      return res.status(404).json({ message: 'Progress report not found' });
    }

    // Check if user is a supervisor
    if (req.user.role !== 'supervisor') {
      return res.status(403).json({ message: 'Only supervisors can reject progress reports' });
    }

    progressReport.status = 'rejected';
    progressReport.supervisorFeedback = req.body.feedback;
    const updatedProgressReport = await progressReport.save();
    
    // Populate the response
    const populatedReport = await ProgressReport.findById(updatedProgressReport._id)
      .populate({
        path: 'patient',
        select: 'name age gender contactNumber email status',
        model: 'Patient'
      })
      .populate({
        path: 'therapist',
        select: 'name email role',
        model: 'User'
      });
    
    res.json(populatedReport);
  } catch (err) {
    console.error('Error rejecting progress report:', err);
    res.status(500).json({ 
      message: 'Error rejecting progress report',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 