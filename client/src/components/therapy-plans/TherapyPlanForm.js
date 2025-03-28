import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';

const validationSchema = Yup.object({
  patient: Yup.string().required('Patient is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .min(Yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  goals: Yup.array().of(
    Yup.object().shape({
      description: Yup.string().required('Goal description is required'),
      targetDate: Yup.date().required('Target date is required'),
      status: Yup.string().oneOf(['pending', 'in_progress', 'achieved', 'not_achieved']).required('Status is required')
    })
  ).min(1, 'At least one goal is required'),
  activities: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().required('Activity name is required'),
      description: Yup.string().required('Activity description is required'),
      frequency: Yup.string().required('Frequency is required'),
      duration: Yup.number().required('Duration is required'),
      instructions: Yup.string()
    })
  ).min(1, 'At least one activity is required'),
  status: Yup.string()
    .oneOf(['draft', 'pending_approval', 'approved', 'rejected'])
    .required('Status is required'),
  notes: Yup.string()
});

const TherapyPlanForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [supervisors, setSupervisors] = useState([]);

  useEffect(() => {
    const initializeForm = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchPatients(), fetchSupervisors()]);
        if (id) {
          await fetchTherapyPlan();
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize form. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeForm();
  }, [id]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      throw new Error('Failed to fetch patients');
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await api.get('/users/supervisors');
      if (response.data && Array.isArray(response.data)) {
        setSupervisors(response.data);
        if (response.data.length > 0 && !formik.values.supervisor) {
          formik.setFieldValue('supervisor', response.data[0]._id);
        }
      } else {
        throw new Error('Invalid supervisor data format');
      }
    } catch (err) {
      console.error('Error fetching supervisors:', err);
      throw new Error('Failed to fetch supervisors');
    }
  };

  const fetchTherapyPlan = async () => {
    try {
      const response = await api.get(`/therapy-plans/${id}`);
      const plan = response.data;
      formik.setValues({
        patient: plan.patient._id,
        supervisor: plan.supervisor._id,
        startDate: plan.startDate.split('T')[0],
        endDate: plan.endDate.split('T')[0],
        goals: plan.goals.map(goal => ({
          ...goal,
          targetDate: goal.targetDate.split('T')[0]
        })),
        activities: plan.activities,
        status: plan.status,
        notes: plan.notes || ''
      });
    } catch (err) {
      console.error('Error fetching therapy plan:', err);
      throw new Error('Failed to fetch therapy plan details');
    }
  };

  const formik = useFormik({
    initialValues: {
      patient: '',
      supervisor: '',
      startDate: '',
      endDate: '',
      goals: [{
        description: '',
        targetDate: '',
        status: 'pending'
      }],
      activities: [{
        name: '',
        description: '',
        frequency: '',
        duration: '',
        instructions: ''
      }],
      status: 'draft',
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        setLoading(true);
        const formattedValues = {
          ...values,
          therapist: user._id,
          goals: values.goals.map(goal => ({
            ...goal,
            targetDate: new Date(goal.targetDate).toISOString()
          }))
        };

        if (id) {
          await api.put(`/therapy-plans/${id}`, formattedValues);
        } else {
          await api.post('/therapy-plans', formattedValues);
        }
        navigate('/therapy-plans');
      } catch (err) {
        console.error('Error saving therapy plan:', err);
        setError(err.response?.data?.message || 'Failed to save therapy plan. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleAddGoal = () => {
    const goals = [...formik.values.goals];
    goals.push({
      description: '',
      targetDate: '',
      status: 'pending'
    });
    formik.setFieldValue('goals', goals);
  };

  const handleRemoveGoal = (index) => {
    const goals = [...formik.values.goals];
    goals.splice(index, 1);
    formik.setFieldValue('goals', goals);
  };

  const handleAddActivity = () => {
    const activities = [...formik.values.activities];
    activities.push({
      name: '',
      description: '',
      frequency: '',
      duration: '',
      instructions: ''
    });
    formik.setFieldValue('activities', activities);
  };

  const handleRemoveActivity = (index) => {
    const activities = [...formik.values.activities];
    activities.splice(index, 1);
    formik.setFieldValue('activities', activities);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Therapy Plan' : 'Create Therapy Plan'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                name="patient"
                label="Patient"
                value={formik.values.patient}
                onChange={formik.handleChange}
                error={formik.touched.patient && Boolean(formik.errors.patient)}
                helperText={formik.touched.patient && formik.errors.patient}
              >
                {patients.map((patient) => (
                  <MenuItem key={patient._id} value={patient._id}>
                    {patient.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                name="supervisor"
                label="Supervisor"
                value={formik.values.supervisor}
                onChange={formik.handleChange}
                error={formik.touched.supervisor && Boolean(formik.errors.supervisor)}
                helperText={
                  (formik.touched.supervisor && formik.errors.supervisor) ||
                  (supervisors.length === 0 && 'No supervisors available')
                }
                disabled={supervisors.length === 0}
              >
                {supervisors.map((supervisor) => (
                  <MenuItem key={supervisor._id} value={supervisor._id}>
                    {supervisor.name}
                  </MenuItem>
                ))}
              </TextField>
              {supervisors.length === 0 && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Please ensure there is at least one supervisor registered in the system
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                name="startDate"
                label="Start Date"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                helperText={formik.touched.startDate && formik.errors.startDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                name="endDate"
                label="End Date"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                helperText={formik.touched.endDate && formik.errors.endDate}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Goals
                  <IconButton color="primary" onClick={handleAddGoal}>
                    <AddIcon />
                  </IconButton>
                </Typography>
                {formik.values.goals.map((goal, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          name={`goals.${index}.description`}
                          label="Goal Description"
                          value={goal.description}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.goals?.[index]?.description &&
                            Boolean(formik.errors.goals?.[index]?.description)
                          }
                          helperText={
                            formik.touched.goals?.[index]?.description &&
                            formik.errors.goals?.[index]?.description
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          name={`goals.${index}.targetDate`}
                          label="Target Date"
                          value={goal.targetDate}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.goals?.[index]?.targetDate &&
                            Boolean(formik.errors.goals?.[index]?.targetDate)
                          }
                          helperText={
                            formik.touched.goals?.[index]?.targetDate &&
                            formik.errors.goals?.[index]?.targetDate
                          }
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          select
                          name={`goals.${index}.status`}
                          label="Status"
                          value={goal.status}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.goals?.[index]?.status &&
                            Boolean(formik.errors.goals?.[index]?.status)
                          }
                          helperText={
                            formik.touched.goals?.[index]?.status &&
                            formik.errors.goals?.[index]?.status
                          }
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in_progress">In Progress</MenuItem>
                          <MenuItem value="achieved">Achieved</MenuItem>
                          <MenuItem value="not_achieved">Not Achieved</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                    {formik.values.goals.length > 1 && (
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton color="error" onClick={() => handleRemoveGoal(index)}>
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Activities
                  <IconButton color="primary" onClick={handleAddActivity}>
                    <AddIcon />
                  </IconButton>
                </Typography>
                {formik.values.activities.map((activity, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name={`activities.${index}.name`}
                          label="Activity Name"
                          value={activity.name}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.activities?.[index]?.name &&
                            Boolean(formik.errors.activities?.[index]?.name)
                          }
                          helperText={
                            formik.touched.activities?.[index]?.name &&
                            formik.errors.activities?.[index]?.name
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          name={`activities.${index}.frequency`}
                          label="Frequency"
                          value={activity.frequency}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.activities?.[index]?.frequency &&
                            Boolean(formik.errors.activities?.[index]?.frequency)
                          }
                          helperText={
                            formik.touched.activities?.[index]?.frequency &&
                            formik.errors.activities?.[index]?.frequency
                          }
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          name={`activities.${index}.duration`}
                          label="Duration (minutes)"
                          value={activity.duration}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.activities?.[index]?.duration &&
                            Boolean(formik.errors.activities?.[index]?.duration)
                          }
                          helperText={
                            formik.touched.activities?.[index]?.duration &&
                            formik.errors.activities?.[index]?.duration
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name={`activities.${index}.description`}
                          label="Description"
                          value={activity.description}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.activities?.[index]?.description &&
                            Boolean(formik.errors.activities?.[index]?.description)
                          }
                          helperText={
                            formik.touched.activities?.[index]?.description &&
                            formik.errors.activities?.[index]?.description
                          }
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          name={`activities.${index}.instructions`}
                          label="Instructions"
                          value={activity.instructions}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.activities?.[index]?.instructions &&
                            Boolean(formik.errors.activities?.[index]?.instructions)
                          }
                          helperText={
                            formik.touched.activities?.[index]?.instructions &&
                            formik.errors.activities?.[index]?.instructions
                          }
                        />
                      </Grid>
                    </Grid>
                    {formik.values.activities.length > 1 && (
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton color="error" onClick={() => handleRemoveActivity(index)}>
                          <RemoveIcon />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                name="status"
                label="Status"
                value={formik.values.status}
                onChange={formik.handleChange}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="pending_approval">Pending Approval</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="notes"
                label="Notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : (id ? 'Update' : 'Create')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/therapy-plans')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default TherapyPlanForm; 