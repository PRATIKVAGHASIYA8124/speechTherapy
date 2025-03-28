import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme';

// Layout Components
import Layout from './components/layout/Layout';
import Sidebar from './components/layout/Sidebar';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Unauthorized from './components/auth/Unauthorized';
import NotFound from './components/auth/NotFound';

// Feature Components
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import PatientForm from './components/patients/PatientForm';
import TherapyPlanList from './components/therapy-plans/TherapyPlanList';
import TherapyPlanForm from './components/therapy-plans/TherapyPlanForm';
import ProgressReportList from './components/progress-reports/ProgressReportList';
import ProgressReportForm from './components/progress-reports/ProgressReportForm';
import PendingApprovals from './components/approvals/PendingApprovals';
import CompletedReports from './components/reports/CompletedReports';
import ClinicalRatingList from './components/ratings/ClinicalRatingList';
import ClinicalRatingForm from './components/ratings/ClinicalRatingForm';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return (
    <Layout>
      <Sidebar />
      {children}
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/404" element={<NotFound />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Patient Management Routes */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute>
            <PatientList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients/new"
        element={
          <ProtectedRoute allowedRoles={['therapist']}>
            <PatientForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patients/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['therapist']}>
            <PatientForm />
          </ProtectedRoute>
        }
      />

      {/* Therapy Plan Routes */}
      <Route
        path="/therapy-plans"
        element={
          <ProtectedRoute>
            <TherapyPlanList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/therapy-plans/new"
        element={
          <ProtectedRoute allowedRoles={['therapist']}>
            <TherapyPlanForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/therapy-plans/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['therapist']}>
            <TherapyPlanForm />
          </ProtectedRoute>
        }
      />

      {/* Progress Report Routes */}
      <Route
        path="/progress-reports"
        element={
          <ProtectedRoute>
            <ProgressReportList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress-reports/new"
        element={
          <ProtectedRoute allowedRoles={['therapist']}>
            <ProgressReportForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress-reports/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['therapist']}>
            <ProgressReportForm />
          </ProtectedRoute>
        }
      />

      {/* Supervisor-only Routes */}
      <Route
        path="/pending-approvals"
        element={
          <ProtectedRoute allowedRoles={['supervisor']}>
            <PendingApprovals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/completed-reports"
        element={
          <ProtectedRoute allowedRoles={['supervisor']}>
            <CompletedReports />
          </ProtectedRoute>
        }
      />

      {/* Clinical Rating Routes */}
      <Route
        path="/ratings"
        element={
          <ProtectedRoute>
            <ClinicalRatingList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ratings/new"
        element={
          <ProtectedRoute allowedRoles={['therapist']}>
            <ClinicalRatingForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ratings/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['therapist']}>
            <ClinicalRatingForm />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
