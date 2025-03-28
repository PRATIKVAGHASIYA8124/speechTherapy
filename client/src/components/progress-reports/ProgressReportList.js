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
  Alert,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

const ProgressReportList = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setError('Please log in to view progress reports');
      setLoading(false);
      return;
    }
    fetchReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching progress reports...');
      const response = await api.get('/progress-reports');
      console.log('Fetched reports:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }
      
      setReports(response.data);
    } catch (err) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view progress reports.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch progress reports. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      await api.delete(`/progress-reports/${id}`);
      setReports(reports.filter(report => report._id !== id));
    } catch (err) {
      console.error('Error deleting report:', err);
      setError(err.response?.data?.message || 'Failed to delete progress report');
    }
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
          Progress Reports
        </Typography>
        {user?.role !== 'supervisor' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/progress-reports/new')}
          >
            New Report
          </Button>
        )}
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
              <TableCell>Patient</TableCell>
              {user?.role === 'supervisor' && <TableCell>Therapist</TableCell>}
              <TableCell>Session Date</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report._id}>
                <TableCell>{report.patient?.name || 'N/A'}</TableCell>
                {user?.role === 'supervisor' && (
                  <TableCell>{report.therapist?.name || 'N/A'}</TableCell>
                )}
                <TableCell>{new Date(report.sessionDetails.date).toLocaleDateString()}</TableCell>
                <TableCell>{report.sessionDetails.duration} minutes</TableCell>
                <TableCell>{report.status}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/progress-reports/${report._id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  {user?.role !== 'supervisor' && (
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(report._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={user?.role === 'supervisor' ? 6 : 5} align="center">
                  No progress reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ProgressReportList; 