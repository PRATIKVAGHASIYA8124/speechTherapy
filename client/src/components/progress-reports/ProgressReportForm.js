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
      type: 'individual'
    },
    progress: {
      goals: [''],
      achievements: [''],
      challenges: ['']
    },
    nextSteps: [''],
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
      const parts = name.split('.');
      setFormData(prev => {
        let newData = { ...prev };
        let current = newData;
        for (let i = 0; i < parts.length - 1; i++) {
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        return newData;
      });
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

      // Format the data before submission
      const reportData = {
        ...formData,
        therapist: user._id,
        sessionDetails: {
          ...formData.sessionDetails,
          date: new Date(formData.sessionDetails.date),
          duration: Number(formData.sessionDetails.duration),
          type: formData.sessionDetails.type
        },
        progress: {
          goals: formData.progress.goals.filter(goal => goal.trim() !== ''),
          achievements: formData.progress.achievements.filter(achievement => achievement.trim() !== ''),
          challenges: formData.progress.challenges.filter(challenge => challenge.trim() !== '')
        },
        nextSteps: formData.nextSteps.filter(step => step.trim() !== '')
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Session Type</InputLabel>
                <Select
                  name="sessionDetails.type"
                  value={formData.sessionDetails.type}
                  onChange={handleChange}
                  label="Session Type"
                  disabled={loading}
                >
                  <MenuItem value="individual">Individual</MenuItem>
                  <MenuItem value="group">Group</MenuItem>
                  <MenuItem value="family">Family</MenuItem>
                </Select>
              </FormControl>
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
              <Typography variant="h6" gutterBottom>Goals</Typography>
              {formData.progress.goals.map((goal, index) => (
                <Grid item xs={12} key={index} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Goal ${index + 1}`}
                    name={`progress.goals.${index}`}
                    value={goal}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    progress: {
                      ...prev.progress,
                      goals: [...prev.progress.goals, '']
                    }
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Add Goal
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Achievements</Typography>
              {formData.progress.achievements.map((achievement, index) => (
                <Grid item xs={12} key={index} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Achievement ${index + 1}`}
                    name={`progress.achievements.${index}`}
                    value={achievement}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    progress: {
                      ...prev.progress,
                      achievements: [...prev.progress.achievements, '']
                    }
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Add Achievement
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Challenges</Typography>
              {formData.progress.challenges.map((challenge, index) => (
                <Grid item xs={12} key={index} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Challenge ${index + 1}`}
                    name={`progress.challenges.${index}`}
                    value={challenge}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    progress: {
                      ...prev.progress,
                      challenges: [...prev.progress.challenges, '']
                    }
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Add Challenge
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Next Steps</Typography>
              {formData.nextSteps.map((step, index) => (
                <Grid item xs={12} key={index} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`Next Step ${index + 1}`}
                    name={`nextSteps.${index}`}
                    value={step}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </Grid>
              ))}
              <Button
                variant="outlined"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    nextSteps: [...prev.nextSteps, '']
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Add Next Step
              </Button>
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