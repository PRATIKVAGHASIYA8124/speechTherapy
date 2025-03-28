import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <LockOutlinedIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Access Denied
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Unauthorized; 