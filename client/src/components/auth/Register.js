import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),
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
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(['therapist', 'supervisor'], 'Invalid role selection'),
  specialization: Yup.string()
    .required('Specialization is required')
    .min(2, 'Specialization must be at least 2 characters'),
  experience: Yup.number()
    .required('Experience is required')
    .min(0, 'Experience cannot be negative')
    .max(50, 'Experience cannot exceed 50 years')
});

const Register = () => {
  const navigate = useNavigate();
  const { register, api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      specialization: '',
      experience: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        await register(
          values.name,
          values.email,
          values.password,
          values.role,
          values.specialization,
          parseInt(values.experience)
        );
        setSuccess(true);
      } catch (err) {
        console.error('Registration error:', err);
        setError(err.response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.post('/auth/resend-verification', { email: formik.values.email });
      setSuccess(true);
    } catch (err) {
      console.error('Resend verification error:', err);
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Registration Successful!
          </Typography>
          <Typography variant="body1" paragraph>
            Please check your email to verify your account before logging in.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleResendVerification}
              disabled={loading}
              sx={{ mr: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Resend Verification Email'}
            </Button>
            <Button
              variant="outlined"
              component={Link}
              to="/login"
              disabled={loading}
            >
              Go to Login
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Register
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
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

            <Grid item xs={12}>
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
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formik.values.password}
                onChange={handleChange}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formik.values.confirmPassword}
                onChange={handleChange}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={formik.touched.role && Boolean(formik.errors.role)}>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formik.values.role}
                  onChange={handleChange}
                  label="Role"
                  disabled={loading}
                >
                  <MenuItem value="therapist">Therapist</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                </Select>
                {formik.touched.role && formik.errors.role && (
                  <FormHelperText>{formik.errors.role}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specialization"
                name="specialization"
                value={formik.values.specialization}
                onChange={handleChange}
                error={formik.touched.specialization && Boolean(formik.errors.specialization)}
                helperText={formik.touched.specialization && formik.errors.specialization}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Years of Experience"
                name="experience"
                type="number"
                value={formik.values.experience}
                onChange={handleChange}
                error={formik.touched.experience && Boolean(formik.errors.experience)}
                helperText={formik.touched.experience && formik.errors.experience}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Box textAlign="center">
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    Login here
                  </Link>
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Register; 