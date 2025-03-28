import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`patient-tabpanel-${index}`}
    aria-labelledby={`patient-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patient, setPatient] = useState(null);
  const [therapyPlans, setTherapyPlans] = useState([]);
  const [progressReports, setProgressReports] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      const [patientResponse, therapyPlansResponse, progressReportsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/patients/${id}`),
        axios.get(`http://localhost:5000/api/therapy-plans?patient=${id}`),
        axios.get(`http://localhost:5000/api/progress-reports?patient=${id}`)
      ]);

      setPatient(patientResponse.data);
      setTherapyPlans(therapyPlansResponse.data);
      setProgressReports(progressReportsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!patient) {
    return <Typography>Patient not found</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/patients')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Patient Details
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/patients/${id}/edit`)}
        >
          Edit Patient
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Name"
                    secondary={patient.name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Age"
                    secondary={patient.age}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Gender"
                    secondary={patient.gender}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Contact"
                    secondary={patient.contactNumber}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={patient.email || 'Not provided'}
                  />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Medical Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Diagnosis"
                    secondary={patient.diagnosis}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Status"
                    secondary={
                      <Chip
                        label={patient.status}
                        color={
                          patient.status === 'active'
                            ? 'success'
                            : patient.status === 'completed'
                            ? 'primary'
                            : 'error'
                        }
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Total Sessions"
                    secondary={patient.totalSessions}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Last Session"
                    secondary={patient.lastSessionDate ? new Date(patient.lastSessionDate).toLocaleDateString() : 'No sessions yet'}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Therapy Plans" />
          <Tab label="Progress Reports" />
          <Tab label="Clinical Ratings" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/therapy-plans/new?patient=${id}`)}
            >
              New Therapy Plan
            </Button>
          </Box>
          <List>
            {therapyPlans.map((plan) => (
              <Paper key={plan._id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Therapy Plan
                  </Typography>
                  <Chip
                    label={plan.status}
                    color={
                      plan.status === 'approved'
                        ? 'success'
                        : plan.status === 'pending_approval'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(plan.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Goals: {plan.goals.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Activities: {plan.activities.length}
                </Typography>
              </Paper>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/progress-reports/new?patient=${id}`)}
            >
              New Progress Report
            </Button>
          </Box>
          <List>
            {progressReports.map((report) => (
              <Paper key={report._id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Progress Report
                  </Typography>
                  <Chip
                    label={report.status}
                    color={
                      report.status === 'approved'
                        ? 'success'
                        : report.status === 'pending_approval'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(report.sessionDetails.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration: {report.sessionDetails.duration} minutes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Activities: {report.sessionDetails.activitiesPerformed.length}
                </Typography>
              </Paper>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/ratings/new?patient=${id}`)}
            >
              New Clinical Rating
            </Button>
          </Box>
          <List>
            {patient.ratings?.map((rating) => (
              <Paper key={rating._id} sx={{ mb: 2, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    Clinical Rating
                  </Typography>
                  <Chip
                    label={rating.status}
                    color={
                      rating.status === 'published'
                        ? 'success'
                        : rating.status === 'draft'
                        ? 'warning'
                        : 'error'
                    }
                  />
                </Box>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Period: {new Date(rating.evaluationPeriod.startDate).toLocaleDateString()} - {new Date(rating.evaluationPeriod.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Overall Rating: {rating.overallRating.score}/5
                </Typography>
              </Paper>
            ))}
          </List>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default PatientDetails; 