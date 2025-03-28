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
  TextField,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const PendingTherapyPlans = () => {
  const { api, user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    console.log('Current user:', user); // Log current user
    if (!user) {
      setError('Please log in to access this page');
      setLoading(false);
      return;
    }
    
    if (user.role !== 'supervisor') {
      setError('Only supervisors can access this page');
      setLoading(false);
      return;
    }
    
    fetchPendingPlans();
  }, [user]);

  const fetchPendingPlans = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching pending plans...');
      const response = await api.get('/therapy-plans?status=pending_approval');
      console.log('API Response:', response);
      console.log('Fetched pending plans:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }
      
      setPlans(response.data);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view pending approvals.');
      } else {
        setError(err.response?.data?.message || 'Error fetching pending therapy plans. Please try again.');
      }
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
      setLoading(true);
      await api.put(`/therapy-plans/${selectedPlan._id}/approve`, {
        feedback: feedback
      });
      setPlans(plans.filter(p => p._id !== selectedPlan._id));
      setDialogOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      console.error('Error approving plan:', err);
      setError(err.response?.data?.message || 'Error approving therapy plan');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!feedback) {
      setError('Please provide feedback for rejection');
      return;
    }
    try {
      setLoading(true);
      await api.put(`/therapy-plans/${selectedPlan._id}/reject`, {
        feedback: feedback
      });
      setPlans(plans.filter(p => p._id !== selectedPlan._id));
      setDialogOpen(false);
      setSelectedPlan(null);
    } catch (err) {
      console.error('Error rejecting plan:', err);
      setError(err.response?.data?.message || 'Error rejecting therapy plan');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

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
              <TableCell>Patient</TableCell>
              <TableCell>Therapist</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan._id}>
                <TableCell>{plan.patient?.name || 'N/A'}</TableCell>
                <TableCell>{plan.therapist?.name || 'N/A'}</TableCell>
                <TableCell>{new Date(plan.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(plan.endDate).toLocaleDateString()}</TableCell>
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
            {plans.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No pending therapy plans
                </TableCell>
              </TableRow>
            )}
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
          <Button onClick={handleReject} color="error" disabled={loading}>
            Reject
          </Button>
          <Button onClick={handleApprove} color="primary" disabled={loading}>
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PendingTherapyPlans; 