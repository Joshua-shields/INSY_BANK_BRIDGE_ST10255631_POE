//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////coming in part 3//////////////////////////////////////////////////////////////////

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  People,
  Payment,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';

const EmployeeDashboard = ({ onNavigate, onLogout, employee }) => {
  const stats = [
    {
      title: 'Total Customers',
      value: '1,234',
      icon: <People />,
      color: '#2196f3',
    },
    {
      title: 'Pending Payments',
      value: '23',
      icon: <Schedule />,
      color: '#ff9800',
    },
    {
      title: 'Verified Today',
      value: '156',
      icon: <CheckCircle />,
      color: '#4caf50',
    },
    {
      title: 'Total Volume',
      value: '$2.5M',
      icon: <TrendingUp />,
      color: '#9c27b0',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Payment Verified',
      customer: 'John Doe (****1234)',
      amount: '$1,250.00',
      time: '10 minutes ago',
      status: 'completed',
    },
    {
      id: 2,
      action: 'New Customer Registered',
      customer: 'Jane Smith',
      amount: 'Initial Deposit: $500.00',
      time: '25 minutes ago',
      status: 'pending',
    },
    {
      id: 3,
      action: 'Payment Flagged',
      customer: 'Bob Wilson (****5678)',
      amount: '$10,000.00',
      time: '1 hour ago',
      status: 'warning',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'warning': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <NavigationBar 
        employee={employee} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        currentPage="dashboard"
      />
      
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Overview
        </Typography>
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                      {stat.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.title}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          {/* Recent Activities */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Activities
                </Typography>
                <List>
                  {recentActivities.map((activity) => (
                    <ListItem key={activity.id}>
                      <ListItemIcon>
                        {activity.status === 'completed' ? <CheckCircle color="success" /> :
                         activity.status === 'warning' ? <Warning color="error" /> :
                         <Schedule color="warning" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={activity.action}
                        secondary={`${activity.customer} • ${activity.amount} • ${activity.time}`}
                      />
                      <Chip 
                        label={activity.status}
                        color={getStatusColor(activity.status)}
                        size="small"
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box
                    sx={{
                      p: 2,
                      border: '2px dashed #ddd',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                    onClick={() => onNavigate('payments')}
                  >
                    <Payment sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="bold">
                      Review Pending Payments
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      23 payments waiting for verification
                    </Typography>
                  </Box>
                  
                  <Box
                    sx={{
                      p: 2,
                      border: '2px dashed #ddd',
                      borderRadius: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: '#f5f5f5' },
                    }}
                    onClick={() => onNavigate('customers')}
                  >
                    <People sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                    <Typography variant="body1" fontWeight="bold">
                      Manage Customers
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      View and manage customer accounts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default EmployeeDashboard;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////