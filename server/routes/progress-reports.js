const express = require('express');
const router = express.Router();
const ProgressReport = require('../models/ProgressReport');
const { auth } = require('../middleware/auth');

// Create a new progress report
router.post('/', auth, async (req, res) => {
  try {
    const report = new ProgressReport({
      ...req.body,
      therapist: req.user._id
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all progress reports
router.get('/', auth, async (req, res) => {
  try {
    let reports;
    if (req.user.role === 'supervisor') {
      reports = await ProgressReport.find().populate('therapist', 'name email');
    } else {
      reports = await ProgressReport.find({ therapist: req.user._id }).populate('patient', 'name email');
    }
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update report status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const report = await ProgressReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Only therapist can set to pending_approval
    if (req.body.status === 'pending_approval' && req.user.role !== 'therapist') {
      return res.status(403).json({ message: 'Only therapists can submit reports for approval' });
    }

    // Only supervisor can approve
    if (req.body.status === 'approved' && req.user.role !== 'supervisor') {
      return res.status(403).json({ message: 'Only supervisors can approve reports' });
    }

    report.status = req.body.status;
    await report.save();
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 