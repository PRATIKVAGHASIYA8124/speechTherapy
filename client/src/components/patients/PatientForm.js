import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  MenuItem,
  Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
  age: Yup.number()
    .required('Age is required')
    .min(0, 'Age must be a positive number')
    .max(120, 'Age must be less than 120'),
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female', 'other'], 'Invalid gender selection'),
  contactNumber: Yup.string()
    .required('Contact number is required')
    .matches(
      /^[0-9]{10}$/,
      'Contact number must be exactly 10 digits'
    )
    .test(
      'valid-indian-mobile',
      'Please enter a valid Indian mobile number',
      (value) => {
        if (!value) return false;
        // Check if the number starts with 6-9 (valid Indian mobile prefixes)
        return /^[6-9]/.test(value);
      }
    ),
  email: Yup.string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    )
    .test(
      'no-special-chars',
      'Email cannot contain special characters except . _ % + -',
      (value) => {
        if (!value) return true;
        return !/[<>()[\]\\,;:{}|^~`]/.test(value);
      }
    )
    .test(
      'no-consecutive-dots',
      'Email cannot contain consecutive dots',
      (value) => {
        if (!value) return true;
        return !/\.{2,}/.test(value);
      }
    ),
  address: Yup.object({
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string()
      .required('ZIP code is required')
      .matches(/^[0-9]{6}$/, 'ZIP code must be exactly 6 digits'),
    country: Yup.string().required('Country is required')
  }),
  medicalHistory: Yup.string().required('Medical history is required'),
  diagnosis: Yup.string().required('Diagnosis is required'),
  status: Yup.string()
    .required('Status is required')
    .oneOf(['active', 'inactive', 'completed'], 'Invalid status')
});

const PatientForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      age: '',
      gender: '',
      contactNumber: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      },
      medicalHistory: '',
      diagnosis: '',
      status: 'active'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        if (id) {
          await api.put(`/patients/${id}`, values);
        } else {
          await api.post('/patients', values);
        }
        navigate('/patients');
      } catch (err) {
        console.error('Error saving patient:', err);
        setError(err.response?.data?.message || 'Failed to save patient');
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchPatient();
    }
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/patients/${id}`);
      formik.setValues(response.data);
    } catch (err) {
      console.error('Error fetching patient:', err);
      setError('Failed to fetch patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Handle nested address fields
      const [parent, child] = name.split('.');
      formik.setFieldValue(name, value);
    } else {
      formik.setFieldValue(name, value);
    }
  };

  if (loading && isEditing) {
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
          {isEditing ? 'Edit Patient' : 'Add New Patient'}
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
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formik.values.age}
                onChange={handleChange}
                error={formik.touched.age && Boolean(formik.errors.age)}
                helperText={formik.touched.age && formik.errors.age}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                name="gender"
                value={formik.values.gender}
                onChange={handleChange}
                error={formik.touched.gender && Boolean(formik.errors.gender)}
                helperText={formik.touched.gender && formik.errors.gender}
                disabled={loading}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={formik.values.contactNumber}
                onChange={handleChange}
                error={formik.touched.contactNumber && Boolean(formik.errors.contactNumber)}
                helperText={formik.touched.contactNumber && formik.errors.contactNumber}
                disabled={loading}
                placeholder="Enter 10-digit mobile number"
                inputProps={{
                  maxLength: 10,
                  pattern: "[0-9]*",
                  inputMode: "numeric"
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Street Address"
                    name="address.street"
                    value={formik.values.address.street}
                    onChange={handleChange}
                    error={formik.touched.address?.street && Boolean(formik.errors.address?.street)}
                    helperText={formik.touched.address?.street && formik.errors.address?.street}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="address.city"
                    value={formik.values.address.city}
                    onChange={handleChange}
                    error={formik.touched.address?.city && Boolean(formik.errors.address?.city)}
                    helperText={formik.touched.address?.city && formik.errors.address?.city}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="State"
                    name="address.state"
                    value={formik.values.address.state}
                    onChange={handleChange}
                    error={formik.touched.address?.state && Boolean(formik.errors.address?.state)}
                    helperText={formik.touched.address?.state && formik.errors.address?.state}
                    disabled={loading}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    name="address.zipCode"
                    value={formik.values.address.zipCode}
                    onChange={handleChange}
                    error={formik.touched.address?.zipCode && Boolean(formik.errors.address?.zipCode)}
                    helperText={formik.touched.address?.zipCode && formik.errors.address?.zipCode}
                    disabled={loading}
                    inputProps={{
                      maxLength: 6,
                      pattern: "[0-9]*",
                      inputMode: "numeric"
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="address.country"
                    value={formik.values.address.country}
                    onChange={handleChange}
                    error={formik.touched.address?.country && Boolean(formik.errors.address?.country)}
                    helperText={formik.touched.address?.country && formik.errors.address?.country}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical History"
                name="medicalHistory"
                value={formik.values.medicalHistory}
                onChange={handleChange}
                required
                disabled={loading}
                multiline
                rows={3}
                error={formik.touched.medicalHistory && Boolean(formik.errors.medicalHistory)}
                helperText={formik.touched.medicalHistory && formik.errors.medicalHistory}
                placeholder="Enter patient's medical history, including past conditions, surgeries, and treatments"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                name="diagnosis"
                value={formik.values.diagnosis}
                onChange={handleChange}
                required
                disabled={loading}
                multiline
                rows={2}
                error={formik.touched.diagnosis && Boolean(formik.errors.diagnosis)}
                helperText={formik.touched.diagnosis && formik.errors.diagnosis}
                placeholder="Enter current diagnosis and any relevant notes"
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/patients')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : isEditing ? 'Update' : 'Save'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default PatientForm; 