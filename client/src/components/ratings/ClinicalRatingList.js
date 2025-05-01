import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ClinicalRatingList = () => {
  const navigate = useNavigate();
  const { api, user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Hide component for supervisors
  if (user.role === 'supervisor') {
    return null;
  }

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/ratings');
      setRatings(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching clinical ratings:', err);
      setError(err.response?.data?.message || 'Error fetching clinical ratings');
      setRatings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinical rating?')) {
      try {
        await api.delete(`/ratings/${id}`);
        setRatings(prevRatings => prevRatings.filter(rating => rating._id !== id));
      } catch (err) {
        console.error('Error deleting clinical rating:', err);
        setError(err.response?.data?.message || 'Error deleting clinical rating');
      }
    }
  };

  const filteredRatings = ratings.filter(rating =>
    rating.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Clinical Ratings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/ratings/new')}
        >
          Add New Rating
        </Button>
      </Box>

      <TextField
        fullWidth
        margin="normal"
        label="Search clinical ratings"
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
              <TableCell>Patient</TableCell>
              <TableCell>Overall Rating</TableCell>
              <TableCell>Evaluation Period</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRatings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  {searchTerm ? 'No ratings match your search' : 'No clinical ratings found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRatings.map((rating) => (
                <TableRow key={rating._id}>
                  <TableCell>{rating.patient?.name || 'N/A'}</TableCell>
                  <TableCell>{rating.overallRating?.score || 'N/A'}</TableCell>
                  <TableCell>
                    {rating.evaluationPeriod?.startDate && rating.evaluationPeriod?.endDate
                      ? `${new Date(rating.evaluationPeriod.startDate).toLocaleDateString()} - ${new Date(rating.evaluationPeriod.endDate).toLocaleDateString()}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(rating._id)}
                      title="Delete Rating"
                    >
                      <DeleteIcon />
                    </IconButton>
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

export default ClinicalRatingList; 