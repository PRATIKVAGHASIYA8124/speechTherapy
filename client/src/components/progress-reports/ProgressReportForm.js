import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProgressReportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { api, user } = useAuth();
  const [formData, setFormData] = useState({
    patient: '',
    therapyPlan: '',
    sessionDetails: {
      date: new Date().toISOString().split('T')[0],
      duration: '',
      activitiesPerformed: []
    },
    goalProgress: [],
    observations: '',
    recommendations: '',
    status: 'draft'
  });
  const [patients, setPatients] = useState([]);
  const [therapyPlans, setTherapyPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchPatients();
    if (id) {
      setIsEditing(true);
      fetchReport();
    }
  }, [id]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to fetch patients. Please try again later.');
    }
  };

  const fetchTherapyPlans = async (patientId) => {
    try {
      console.log('Fetching therapy plans for patient:', patientId);
      const response = await api.get(`/therapy-plans?patient=${patientId}`);
      console.log('Therapy plans response:', response.data);
      setTherapyPlans(response.data);
    } catch (err) {
      console.error('Error fetching therapy plans:', err);
      setError('Failed to fetch therapy plans. Please try again later.');
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/progress-reports/${id}`);
      setFormData(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Failed to fetch report details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePatientChange = async (e) => {
    const patientId = e.target.value;
    console.log('Patient selected:', patientId);
    handleChange(e);
    await fetchTherapyPlans(patientId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const reportData = {
        ...formData,
        therapist: user._id
      };
      
      if (isEditing) {
        await api.put(`/progress-reports/${id}`, reportData);
      } else {
        await api.post('/progress-reports', reportData);
      }
      navigate('/progress-reports');
    } catch (err) {
      console.error('Error saving report:', err);
      setError(err.response?.data?.message || 'Failed to save report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditing ? 'Edit Progress Report' : 'New Progress Report'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Patient</InputLabel>
                <Select
                  name="patient"
                  value={formData.patient}
                  onChange={handlePatientChange}
                  label="Patient"
                  disabled={loading}
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient._id} value={patient._id}>
                      {patient.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Therapy Plan</InputLabel>
                <Select
                  name="therapyPlan"
                  value={formData.therapyPlan}
                  onChange={handleChange}
                  label="Therapy Plan"
                  disabled={loading || !formData.patient}
                >
                  {therapyPlans.length === 0 ? (
                    <MenuItem value="" disabled>
                      No therapy plans found for this patient
                    </MenuItem>
                  ) : (
                    therapyPlans.map((plan) => (
                      <MenuItem key={plan._id} value={plan._id}>
                        {plan.title || `Plan by ${plan.therapist?.name || 'Unknown Therapist'} (${new Date(plan.startDate).toLocaleDateString()})`}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Session Date"
                name="sessionDetails.date"
                type="date"
                value={formData.sessionDetails.date}
                onChange={handleChange}
                required
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Session Duration (minutes)"
                name="sessionDetails.duration"
                type="number"
                value={formData.sessionDetails.duration}
                onChange={handleChange}
                required
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  disabled={loading}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="pending_approval">Pending Approval</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observations"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                multiline
                rows={4}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Recommendations"
                name="recommendations"
                value={formData.recommendations}
                onChange={handleChange}
                multiline
                rows={3}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/progress-reports')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Report'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProgressReportForm; 