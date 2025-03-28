import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  Rating
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object({
  patient: Yup.string().required('Patient is required'),
  date: Yup.date().required('Date is required'),
  category: Yup.string().required('Category is required'),
  score: Yup.number()
    .required('Score is required')
    .min(0, 'Score must be at least 0')
    .max(5, 'Score must be at most 5'),
  notes: Yup.string().required('Notes are required')
});

const categories = [
  'Articulation',
  'Fluency',
  'Voice',
  'Language Comprehension',
  'Language Expression',
  'Social Communication'
];

const ClinicalRatingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetchPatients();
    if (id) {
      fetchRating();
    }
  }, [id]);

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/patients');
      setPatients(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching patients');
    }
  };

  const fetchRating = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/ratings/${id}`);
      const rating = response.data;
      formik.setValues({
        patient: rating.patient._id,
        date: rating.date.split('T')[0],
        category: rating.category,
        score: rating.score,
        notes: rating.notes
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching clinical rating');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      patient: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      score: 0,
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError('');
        setLoading(true);
        if (id) {
          await axios.put(`http://localhost:5000/api/ratings/${id}`, values);
        } else {
          await axios.post('http://localhost:5000/api/ratings', values);
        }
        navigate('/ratings');
      } catch (err) {
        setError(err.response?.data?.message || 'Error saving clinical rating');
      } finally {
        setLoading(false);
      }
    }
  });

  if (loading && id) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {id ? 'Edit Clinical Rating' : 'Create Clinical Rating'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                name="patient"
                label="Patient"
                value={formik.values.patient}
                onChange={formik.handleChange}
                error={formik.touched.patient && Boolean(formik.errors.patient)}
                helperText={formik.touched.patient && formik.errors.patient}
              >
                {patients.map((patient) => (
                  <MenuItem key={patient._id} value={patient._id}>
                    {patient.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                name="date"
                label="Date"
                value={formik.values.date}
                onChange={formik.handleChange}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                name="category"
                label="Category"
                value={formik.values.category}
                onChange={formik.handleChange}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Typography component="legend">Score</Typography>
                <Rating
                  name="score"
                  value={Number(formik.values.score)}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('score', newValue);
                  }}
                />
                {formik.touched.score && formik.errors.score && (
                  <Typography color="error" variant="caption">
                    {formik.errors.score}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="notes"
                label="Notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                error={formik.touched.notes && Boolean(formik.errors.notes)}
                helperText={formik.touched.notes && formik.errors.notes}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : (id ? 'Update' : 'Create')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/ratings')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ClinicalRatingForm; 