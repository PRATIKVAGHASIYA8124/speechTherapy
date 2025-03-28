import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import axios from 'axios';

const PendingTherapyPlans = () => {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingPlans();
  }, []);

  const fetchPendingPlans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/therapy-plans?status=pending_approval');
      setPlans(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching pending therapy plans');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (plan) => {
    setSelectedPlan(plan);
    setFeedback('');
    setDialogOpen(true);
  };

  const handleApprove = async () => {
    try {
      await axios.put(`http://localhost:5000/api/therapy-plans/${selectedPlan._id}/approve`, {
        feedback: feedback
      });
      setPlans(plans.filter(p => p._id !== selectedPlan._id));
      setDialogOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving therapy plan');
    }
  };

  const handleReject = async () => {
    if (!feedback) {
      setError('Please provide feedback for rejection');
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/therapy-plans/${selectedPlan._id}/reject`, {
        feedback: feedback
      });
      setPlans(plans.filter(p => p._id !== selectedPlan._id));
      setDialogOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error rejecting therapy plan');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pending Therapy Plans
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Therapist</TableCell>
              <TableCell>Submission Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell>{plan.title}</TableCell>
                <TableCell>{plan.patient?.name}</TableCell>
                <TableCell>{plan.therapist?.name}</TableCell>
                <TableCell>{new Date(plan.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleReview(plan)}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Therapy Plan</DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Plan Details
              </Typography>
              <Typography><strong>Title:</strong> {selectedPlan.title}</Typography>
              <Typography><strong>Patient:</strong> {selectedPlan.patient?.name}</Typography>
              <Typography><strong>Therapist:</strong> {selectedPlan.therapist?.name}</Typography>
              <Typography><strong>Start Date:</strong> {new Date(selectedPlan.startDate).toLocaleDateString()}</Typography>
              <Typography><strong>End Date:</strong> {new Date(selectedPlan.endDate).toLocaleDateString()}</Typography>
              
              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                Goals
              </Typography>
              {selectedPlan.goals.map((goal, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography>
                    {index + 1}. {goal.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                  </Typography>
                </Box>
              ))}

              <Typography variant="h6" sx={{ mt: 2 }} gutterBottom>
                Activities
              </Typography>
              {selectedPlan.activities.map((activity, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography>
                    {index + 1}. {activity.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.description}
                  </Typography>
                </Box>
              ))}

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error">
            Reject
          </Button>
          <Button onClick={handleApprove} color="primary" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PendingTherapyPlans; 