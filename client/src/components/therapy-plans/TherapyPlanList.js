import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const TherapyPlanList = () => {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [therapyPlans, setTherapyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTherapyPlans();
  }, []);

  const fetchTherapyPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/therapy-plans');
      setTherapyPlans(response.data);
    } catch (err) {
      console.error('Error fetching therapy plans:', err);
      setError('Failed to fetch therapy plans. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/therapy-plans/new');
  };

  const handleEdit = (id) => {
    navigate(`/therapy-plans/${id}/edit`);
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Therapy Plans
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateNew}
        >
          Create New Plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient Name</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {therapyPlans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No therapy plans found
                </TableCell>
              </TableRow>
            ) : (
              therapyPlans.map((plan) => (
                <TableRow key={plan._id}>
                  <TableCell>{plan.patient?.name || 'N/A'}</TableCell>
                  <TableCell>{new Date(plan.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(plan.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{plan.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleEdit(plan._id)}
                    >
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TherapyPlanList; 