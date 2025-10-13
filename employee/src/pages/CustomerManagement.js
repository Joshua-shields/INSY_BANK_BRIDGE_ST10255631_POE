//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////coming in part 3//////////////////////////////////////////////////////////////////
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
} from '@mui/material';
import { Visibility, Block, CheckCircle } from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';

const CustomerManagement = ({ onNavigate, onLogout, employee }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const customers = [
    {
      id: 1,
      name: 'John Doe',
      accountNumber: '1234567890',
      email: 'john@example.com',
      phone: '+1234567890',
      balance: 5000.00,
      status: 'Active',
      joinDate: '2023-01-15',
      lastTransaction: '2025-09-22',
    },
    {
      id: 2,
      name: 'Jane Smith',
      accountNumber: '2345678901',
      email: 'jane@example.com',
      phone: '+1234567891',
      balance: 3500.50,
      status: 'Active',
      joinDate: '2023-03-20',
      lastTransaction: '2025-09-23',
    },
    {
      id: 3,
      name: 'Bob Wilson',
      accountNumber: '3456789012',
      email: 'bob@example.com',
      phone: '+1234567892',
      balance: 1200.75,
      status: 'Suspended',
      joinDate: '2023-05-10',
      lastTransaction: '2025-09-20',
    },
  ];

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <NavigationBar 
        employee={employee} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        currentPage="customers"
      />
      
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Customer Management
        </Typography>
        
        <Card>
          <CardContent>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Customer Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Account Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Balance</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Last Transaction</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} hover>
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {customer.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{customer.accountNumber}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="bold">
                          ${customer.balance.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={customer.status}
                          color={getStatusColor(customer.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{customer.lastTransaction}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          onClick={() => handleViewCustomer(customer)}
                          sx={{ mr: 1 }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Customer Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Customer Details - {selectedCustomer?.name}
        </DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Full Name"
                  value={selectedCustomer.name}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Account Number"
                  value={selectedCustomer.accountNumber}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Email"
                  value={selectedCustomer.email}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Phone"
                  value={selectedCustomer.phone}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Current Balance"
                  value={`$${selectedCustomer.balance.toFixed(2)}`}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Account Status"
                  value={selectedCustomer.status}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Join Date"
                  value={selectedCustomer.joinDate}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Last Transaction"
                  value={selectedCustomer.lastTransaction}
                  fullWidth
                  disabled
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          {selectedCustomer?.status === 'Active' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Block />}
            >
              Suspend Account
            </Button>
          )}
          {selectedCustomer?.status === 'Suspended' && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircle />}
            >
              Activate Account
            </Button>
          )}
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerManagement;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////