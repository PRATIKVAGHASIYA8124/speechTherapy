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
  Slider,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProgressReportForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { api } = useAuth();
  const [formData, setFormData] = useState({
    patient: '',
    date: new Date().toISOString().split('T')[0],
    status: 'in progress',
    progress: 0,
    notes: '',
    goals: '',
    challenges: '',
    nextSteps: ''
  });
  const [patients, setPatients] = useState([]);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProgressChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      progress: newValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      if (isEditing) {
        await api.put(`/progress-reports/${id}`, formData);
      } else {
        await api.post('/progress-reports', formData);
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
                  onChange={handleChange}
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

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                disabled={loading}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                  disabled={loading}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Progress</Typography>
              <Slider
                value={formData.progress}
                onChange={handleProgressChange}
                disabled={loading}
                valueLabelDisplay="auto"
                step={10}
                marks
                min={0}
                max={100}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={3}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goals"
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                multiline
                rows={2}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Challenges"
                name="challenges"
                value={formData.challenges}
                onChange={handleChange}
                multiline
                rows={2}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Next Steps"
                name="nextSteps"
                value={formData.nextSteps}
                onChange={handleChange}
                multiline
                rows={2}
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
                  {loading ? <CircularProgress size={24} /> : isEditing ? 'Update' : 'Save'}
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