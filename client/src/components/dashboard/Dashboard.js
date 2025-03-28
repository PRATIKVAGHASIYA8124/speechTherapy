import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  PendingActions as PendingIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    elevation={2}
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4,
      },
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Box
        sx={{
          backgroundColor: `${color}.lighter`,
          color: `${color}.main`,
          borderRadius: 2,
          p: 1,
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
    </Box>
    <Typography variant="h3" component="div" sx={{ flexGrow: 1, fontWeight: 'medium' }}>
      {value}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/dashboard/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError('Failed to load dashboard statistics. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const isSupervisor = user?.role === 'supervisor';

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome back, {user?.name}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Here's an overview of your {isSupervisor ? 'system' : 'activity'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {isSupervisor ? (
          // Supervisor Dashboard Stats
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Patients"
                value={stats?.totalPatients || 0}
                icon={<PeopleIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Approvals"
                value={stats?.pendingApprovals || 0}
                icon={<PendingIcon />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Plans"
                value={stats?.activeTherapyPlans || 0}
                icon={<AssignmentIcon />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Completed Reports"
                value={stats?.completedReports || 0}
                icon={<CheckCircleIcon />}
                color="success"
              />
            </Grid>
          </>
        ) : (
          // Therapist Dashboard Stats
          <>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="My Patients"
                value={stats?.myPatients || 0}
                icon={<PeopleIcon />}
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Active Plans"
                value={stats?.myTherapyPlans || 0}
                icon={<AssignmentIcon />}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Pending Reports"
                value={stats?.pendingReports || 0}
                icon={<AssessmentIcon />}
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Clinical Ratings"
                value={stats?.clinicalRatings || 0}
                icon={<StarIcon />}
                color="info"
              />
            </Grid>
          </>
        )}
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Recent Activity
        </Typography>
        <Paper 
          elevation={2}
          sx={{ 
            p: 3,
            backgroundColor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No recent activity to display.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 