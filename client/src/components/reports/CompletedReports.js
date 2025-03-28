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
  Visibility as ViewIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const CompletedReports = () => {
  const { api } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompletedReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/reports/completed');
        setReports(response.data);
      } catch (err) {
        console.error('Failed to fetch completed reports:', err);
        setError('Failed to load completed reports');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedReports();
  }, [api]);

  const handleDownload = async (id) => {
    try {
      const response = await api.get(`/reports/${id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download report:', err);
      setError('Failed to download report');
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
        Completed Reports
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
                <TableCell>Report Type</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Therapist</TableCell>
                <TableCell>Completion Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No completed reports
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>{report.patientName}</TableCell>
                    <TableCell>{report.therapistName}</TableCell>
                    <TableCell>
                      {new Date(report.completionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label="Completed"
                        color="success"
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
                          color="primary"
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(report.id)}
                        >
                          Download
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

export default CompletedReports; 