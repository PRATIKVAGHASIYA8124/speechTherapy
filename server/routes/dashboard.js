const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Patient = require('../models/Patient');
const TherapyPlan = require('../models/TherapyPlan');
const ProgressReport = require('../models/ProgressReport');
const ClinicalRating = require('../models/ClinicalRating');

// Get dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'supervisor') {
      // Get supervisor statistics
      const [
        totalPatients,
        activeTherapyPlans,
        pendingApprovals,
        completedReports
      ] = await Promise.all([
        Patient.countDocuments(),
        TherapyPlan.countDocuments({ status: 'active' }),
        TherapyPlan.countDocuments({ status: 'pending_approval' }),
        ProgressReport.countDocuments({ status: 'completed' })
      ]);

      stats = {
        totalPatients,
        activeTherapyPlans,
        pendingApprovals,
        completedReports
      };
    } else {
      // Get therapist statistics
      const [
        myPatients,
        myTherapyPlans,
        pendingReports,
        clinicalRatings
      ] = await Promise.all([
        Patient.countDocuments({ therapist: userId }),
        TherapyPlan.countDocuments({ therapist: userId, status: 'active' }),
        ProgressReport.countDocuments({ therapist: userId, status: 'pending' }),
        ClinicalRating.countDocuments({ therapist: userId })
      ]);

      stats = {
        myPatients,
        myTherapyPlans,
        pendingReports,
        clinicalRatings
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

module.exports = router; 