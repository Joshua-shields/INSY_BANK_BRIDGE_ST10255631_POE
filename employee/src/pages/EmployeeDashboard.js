//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////coming in part 3//////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
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
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingPayments: 0,
    verifiedToday: 0,
    totalVolume: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch('http://localhost:3000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats({
            totalCustomers: data.totalCustomers,
            pendingPayments: data.pendingPayments,
            verifiedToday: data.verifiedToday,
            totalVolume: data.totalVolume,
          });
        } else {
          setError('Failed to fetch stats');
        }
      } catch (err) {
        setError('Error fetching stats');
      }
    };

    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/admin/activities', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRecentActivities(data.activities);
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
      }
    };

    const fetchData = async () => {
      await fetchStats();
      await fetchActivities();
    };

    fetchData();
    setLoading(false);

    // Set up polling every 30 seconds
    const interval = setInterval(fetchData, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const displayStats = [
    {
      title: 'Total Customers',
      value: loading ? '...' : stats.totalCustomers.toLocaleString(),
      icon: <People />,
      color: '#2196f3',
    },
    {
      title: 'Pending Payments',
      value: loading ? '...' : stats.pendingPayments.toString(),
      icon: <Schedule />,
      color: '#ff9800',
    },
    {
      title: 'Verified Today',
      value: loading ? '...' : stats.verifiedToday.toString(),
      icon: <CheckCircle />,
      color: '#4caf50',
    },
    {
      title: 'Total Volume',
      value: loading ? '...' : `$${stats.totalVolume.toLocaleString()}`,
      icon: <TrendingUp />,
      color: '#9c27b0',
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
        
        {error && (
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
        )}
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {displayStats.map((stat, index) => (
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
                      {stats.pendingPayments} payment{stats.pendingPayments !== 1 ? 's' : ''} waiting for verification
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