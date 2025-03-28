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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';

const ClinicalRatingList = () => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/ratings');
      setRatings(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching clinical ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this clinical rating?')) {
      try {
        await axios.delete(`http://localhost:5000/api/ratings/${id}`);
        setRatings(ratings.filter(rating => rating._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting clinical rating');
      }
    }
  };

  const filteredRatings = ratings.filter(rating =>
    rating.patient?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Clinical Ratings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/ratings/new')}
        >
          Add Clinical Rating
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
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Score</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRatings.map((rating) => (
              <TableRow key={rating._id}>
                <TableCell>{rating.patient?.name}</TableCell>
                <TableCell>{new Date(rating.date).toLocaleDateString()}</TableCell>
                <TableCell>{rating.category}</TableCell>
                <TableCell>{rating.score}</TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={() => navigate(`/ratings/${rating._id}`)}
                    color="primary"
                  >
                    <ViewIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => navigate(`/ratings/${rating._id}/edit`)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(rating._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ClinicalRatingList; 