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
    const fetchPendingApprovals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/approvals/pending');
        setPendingItems(response.data);
      } catch (err) {
        console.error('Failed to fetch pending approvals:', err);
        setError('Failed to load pending approvals');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingApprovals();
  }, [api]);

  const handleApprove = async (id) => {
    try {
      await api.post(`/approvals/${id}/approve`);
      setPendingItems(pendingItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to approve item:', err);
      setError('Failed to approve item');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/approvals/${id}/reject`);
      setPendingItems(pendingItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to reject item:', err);
      setError('Failed to reject item');
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
                          onClick={() => {/* Handle view */}}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleApprove(item.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<RejectIcon />}
                          onClick={() => handleReject(item.id)}
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