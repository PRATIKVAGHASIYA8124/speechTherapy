import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const ProgressReportDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/progress-reports/${id}`);
        setReport(response.data);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError(err.response?.data?.message || 'Failed to fetch report details');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, api]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Report not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/progress-reports')}
        >
          Back to Reports
        </Button>
        {user.role === 'therapist' && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/progress-reports/${id}/edit`)}
          >
            Edit Report
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
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

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>Patient Information</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Name"
                  secondary={report.patient?.name || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Age"
                  secondary={report.patient?.age || 'N/A'}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Gender"
                  secondary={report.patient?.gender || 'N/A'}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="h6" gutterBottom>Session Details</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Date"
                  secondary={new Date(report.sessionDetails.date).toLocaleDateString()}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Duration"
                  secondary={`${report.sessionDetails.duration} minutes`}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Type"
                  secondary={report.sessionDetails.type}
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Progress</Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Goals"
                  secondary={
                    <List>
                      {report.progress.goals.map((goal, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${index + 1}. ${goal}`} />
                        </ListItem>
                      ))}
                    </List>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Achievements"
                  secondary={
                    <List>
                      {report.progress.achievements.map((achievement, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${index + 1}. ${achievement}`} />
                        </ListItem>
                      ))}
                    </List>
                  }
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Challenges"
                  secondary={
                    <List>
                      {report.progress.challenges.map((challenge, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={`${index + 1}. ${challenge}`} />
                        </ListItem>
                      ))}
                    </List>
                  }
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>Next Steps</Typography>
            <List>
              {report.nextSteps.map((step, index) => (
                <ListItem key={index}>
                  <ListItemText primary={`${index + 1}. ${step}`} />
                </ListItem>
              ))}
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProgressReportDetails; 