import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Toolbar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  PendingActions as PendingIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

const therapistMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'My Patients', icon: <PeopleIcon />, path: '/patients' },
  { text: 'My Therapy Plans', icon: <AssignmentIcon />, path: '/therapy-plans' },
  { text: 'My Progress Reports', icon: <AssessmentIcon />, path: '/progress-reports' },
  { text: 'Clinical Ratings', icon: <StarIcon />, path: '/clinical-ratings' },
];

const supervisorMenuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'All Patients', icon: <PeopleIcon />, path: '/patients' },
  { text: 'Pending Approvals', icon: <PendingIcon />, path: '/pending-approvals' },
  { text: 'All Therapy Plans', icon: <AssignmentIcon />, path: '/therapy-plans' },
  { text: 'All Progress Reports', icon: <AssessmentIcon />, path: '/progress-reports' },
  { text: 'Clinical Ratings', icon: <StarIcon />, path: '/clinical-ratings' },
  { text: 'Completed Reports', icon: <CheckCircleIcon />, path: '/completed-reports' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = user?.role === 'supervisor' ? supervisorMenuItems : therapistMenuItems;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Toolbar /> {/* This creates space for the AppBar */}
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mt: 2, mb: 2 }} />

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {user?.role}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 