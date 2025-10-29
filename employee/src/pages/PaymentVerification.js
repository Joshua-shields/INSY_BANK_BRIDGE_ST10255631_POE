//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////coming in part 3//////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
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
  Alert,
} from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';

const PaymentVerification = ({ onNavigate, onLogout, employee }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch('http://localhost:3000/api/employee/payments/pending', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedPayments = data.transactions.map(txn => ({
            id: txn._id,
            customerName: txn.user ? txn.user.name : 'Unknown',
            customerAccount: txn.user ? txn.user.accountNumber : 'Unknown',
            recipientName: txn.transactionType === 'international' ? txn.accountHolderName : txn.recipientName,
            recipientAccount: txn.transactionType === 'international' ? txn.accountNumber : 'LOCAL',
            amount: txn.amount,
            reference: txn.reference || '',
            date: txn.transactionDate ? txn.transactionDate.split('T')[0] : 'N/A',
            status: 'Pending',
            swiftCode: txn.swiftCode || '',
          }));
          setPayments(formattedPayments);
        } else {
          setError('Failed to fetch payments');
        }
      } catch (err) {
        setError('Error fetching payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPayment(null);
    setVerificationNote('');
  };

  const handleVerifyPayment = async (action) => {
    if (selectedPayment) {
      try {
        const token = localStorage.getItem('authToken');
        const status = action === 'approve' ? 'verified' : 'rejected';
        
        const response = await fetch(`http://localhost:3000/api/employee/payments/${selectedPayment.id}/verify`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

        if (response.ok) {
          setPayments(prev => 
            prev.map(payment => 
              payment.id === selectedPayment.id 
                ? { ...payment, status: action === 'approve' ? 'Approved' : 'Rejected' }
                : payment
            )
          );
          handleCloseDialog();
        } else {
          alert('Failed to verify payment');
        }
      } catch (err) {
        alert('Error verifying payment');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'Pending');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      <NavigationBar 
        employee={employee} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        currentPage="payments"
      />
      
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Payment Verification
        </Typography>
        
        {error && (
          <Typography variant="body1" color="error" gutterBottom>
            {error}
          </Typography>
        )}
        
        {loading ? (
          <Typography>Loading payments...</Typography>
        ) : (
          <div>
            {pendingPayments.length === 0 && (
              <Alert severity="info" sx={{ mb: 3 }}>
                No pending payments require verification at this time.
              </Alert>
            )}
            
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Pending Payments ({pendingPayments.length})
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Payment ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Customer</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Recipient</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="bold">
                              {payment.id}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1">{payment.customerName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {payment.customerAccount}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body1">{payment.recipientName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {payment.recipientAccount}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body1" fontWeight="bold" color="primary">
                              R{payment.amount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>
                            <Chip 
                              label={payment.status}
                              color={getStatusColor(payment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Visibility />}
                              onClick={() => handleViewPayment(payment)}
                            >
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </Box>

      {/* Payment Review Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Payment Review - {selectedPayment?.id}
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <div>
              <Grid container spacing={3} sx={{ mt: 1, mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Name"
                    value={selectedPayment.customerName}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Customer Account"
                    value={selectedPayment.customerAccount}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Recipient Name"
                    value={selectedPayment.recipientName}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Recipient Account"
                    value={selectedPayment.recipientAccount}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Amount"
                    value={`R${selectedPayment.amount.toFixed(2)}`}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="SWIFT Code"
                    value={selectedPayment.swiftCode || 'N/A'}
                    fullWidth
                    disabled
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Reference"
                    value={selectedPayment.reference}
                    fullWidth
                    multiline
                    rows={2}
                    disabled
                  />
                </Grid>
              </Grid>

              {selectedPayment.amount > 5000 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  This is a high-value transaction requiring additional verification.
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentVerification;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////