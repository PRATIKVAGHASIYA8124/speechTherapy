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
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const PendingApprovals = () => {
  const { api } = useAuth();
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch pending therapy plans
        const therapyPlansResponse = await api.get('/therapy-plans?status=pending_approval');
        const therapyPlans = therapyPlansResponse.data.map(plan => ({
          id: plan._id,
          type: 'Therapy Plan',
          submittedBy: plan.therapist?.name || 'Unknown Therapist',
          patientName: plan.patient?.name || 'Unknown Patient',
          submissionDate: plan.createdAt,
          status: plan.status,
          item: plan
        }));

        // Fetch pending progress reports
        const progressReportsResponse = await api.get('/progress-reports?status=pending_approval');
        const progressReports = progressReportsResponse.data.map(report => ({
          id: report._id,
          type: 'Progress Report',
          submittedBy: report.therapist?.name || 'Unknown Therapist',
          patientName: report.patient?.name || 'Unknown Patient',
          submissionDate: report.createdAt,
          status: report.status,
          item: report
        }));

        setPendingItems([...therapyPlans, ...progressReports]);
      } catch (err) {
        console.error('Failed to fetch pending items:', err);
        setError('Failed to load pending approvals');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingItems();
  }, [api]);

  const handleApprove = async (id, type) => {
    try {
      const endpoint = type === 'Therapy Plan' ? '/therapy-plans' : '/progress-reports';
      const response = await api.put(`${endpoint}/${id}/approve`, {
        feedback: 'Approved by supervisor'
      });
      
      if (response.data) {
        setPendingItems(pendingItems.filter(item => item.id !== id));
      } else {
        setError('Failed to approve item. Please try again.');
      }
    } catch (err) {
      console.error('Failed to approve item:', err);
      setError(err.response?.data?.message || 'Failed to approve item. Please try again.');
    }
  };

  const handleReject = async (id, type) => {
    try {
      const endpoint = type === 'Therapy Plan' ? '/therapy-plans' : '/progress-reports';
      const response = await api.put(`${endpoint}/${id}/reject`, {
        feedback: 'Rejected by supervisor'
      });
      
      if (response.data) {
        setPendingItems(pendingItems.filter(item => item.id !== id));
      } else {
        setError('Failed to reject item. Please try again.');
      }
    } catch (err) {
      console.error('Failed to reject item:', err);
      setError(err.response?.data?.message || 'Failed to reject item. Please try again.');
    }
  };

  const handleView = (item) => {
    if (item.type === 'Therapy Plan') {
      window.open(`/therapy-plans/${item.id}`, '_blank');
    } else {
      window.open(`/progress-reports/${item.id}`, '_blank');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Pending Approvals
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Submission Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No pending approvals
                  </TableCell>
                </TableRow>
              ) : (
                pendingItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.type}</TableCell>
                    <TableCell>{item.submittedBy}</TableCell>
                    <TableCell>{item.patientName}</TableCell>
                    <TableCell>
                      {new Date(item.submissionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Pending"
                        color="warning"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => handleView(item)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleApprove(item.id, item.type)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => handleReject(item.id, item.type)}
                        >
                          Reject
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default PendingApprovals; 