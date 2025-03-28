import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PatientList = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to fetch patients. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (user) {
      fetchPatients();
    }
  }, [user, fetchPatients]);

  const handleCreateNew = () => {
    navigate('/patients/new');
  };

  const handleEdit = (id) => {
    navigate(`/patients/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/patients/${id}`);
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.therapist?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Please log in to view patients</Typography>
      </Box>
    );
  }

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
          {user.role === 'supervisor' ? 'All Patients' : 'My Patients'}
        </Typography>
        {user.role === 'therapist' && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateNew}
          >
            Add New Patient
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        margin="normal"
        label="Search patients"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Contact</TableCell>
              {user.role === 'supervisor' && <TableCell>Therapist</TableCell>}
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user.role === 'supervisor' ? 7 : 6} align="center">
                  {searchTerm ? 'No patients match your search' : 'No patients found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => (
                <TableRow key={patient._id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>{patient.contact}</TableCell>
                  {user.role === 'supervisor' && (
                    <TableCell>{patient.therapist?.name || 'Unassigned'}</TableCell>
                  )}
                  <TableCell>
                    <Chip 
                      label={patient.status} 
                      color={patient.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleView(patient._id)}
                      >
                        View
                      </Button>
                      {user.role === 'therapist' && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEdit(patient._id)}
                        >
                          Edit
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default PatientList; 