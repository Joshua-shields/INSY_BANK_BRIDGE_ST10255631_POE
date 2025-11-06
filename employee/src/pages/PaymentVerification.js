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
  Snackbar,
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
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDenyDialog, setConfirmDenyDialog] = useState(false);
  const [confirmApproveDialog, setConfirmApproveDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('No authentication token found');
          return;
        }

        const response = await fetch('https://localhost:3000/api/employee/payments/pending', {
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

    // Set up polling every 30 seconds
    const interval = setInterval(fetchPayments, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPayment(null);
    setVerificationNote('');
    setConfirmDenyDialog(false);
    setConfirmApproveDialog(false);
  };

  const handleDenyClick = () => {
    setConfirmDenyDialog(true);
  };

  const handleApproveClick = () => {
    setConfirmApproveDialog(true);
  };

  const handleConfirmDeny = async () => {
    if (selectedPayment) {
      try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`https://localhost:3000/api/employee/payments/${selectedPayment.id}/deny`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'denied',
            note: verificationNote
          }),
        });

        if (response.ok) {
          // Remove the denied payment from the list
          setPayments(prev => prev.filter(payment => payment.id !== selectedPayment.id));
          setSuccessMessage(`Payment ${selectedPayment.id} has been denied successfully`);
          setSnackbarOpen(true);
          handleCloseDialog();

          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to deny payment');
        }
      } catch (err) {
        setError('Error denying payment');
      }
    }
  };

  const handleConfirmApprove = async () => {
    if (selectedPayment) {
      try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`https://localhost:3000/api/employee/payments/${selectedPayment.id}/verify`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'verified'
          }),
        });

        if (response.ok) {
          // Remove the approved payment from the list
          setPayments(prev => prev.filter(payment => payment.id !== selectedPayment.id));
          setSuccessMessage(`Payment ${selectedPayment.id} has been approved successfully`);
          setSnackbarOpen(true);
          handleCloseDialog();

          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to approve payment');
        }
      } catch (err) {
        setError('Error approving payment');
      }
    }
  };

  const handleVerifyPayment = async (action) => {
    if (selectedPayment) {
      try {
        const token = localStorage.getItem('authToken');
        const status = action === 'approve' ? 'verified' : 'rejected';
        
        const response = await fetch(`https://localhost:3000/api/employee/payments/${selectedPayment.id}/verify`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

        if (response.ok) {
          // Remove the payment from the list after approval
          setPayments(prev => prev.filter(payment => payment.id !== selectedPayment.id));
          setSuccessMessage(`Payment ${selectedPayment.id} has been ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
          setSnackbarOpen(true);
          handleCloseDialog();
          
          // Clear success message after 5 seconds
          setTimeout(() => setSuccessMessage(''), 5000);
        } else {
          const errorData = await response.json();
          setError(errorData.error || `Failed to ${action} payment`);
        }
      } catch (err) {
        setError(`Error ${action}ing payment`);
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
  const localPayments = pendingPayments.filter(p => p.recipientAccount === 'LOCAL');
  const internationalPayments = pendingPayments.filter(p => p.recipientAccount !== 'LOCAL');

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
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
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
            
            {localPayments.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Local Payments ({localPayments.length})
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
                        {localPayments.map((payment) => (
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
            )}

            {internationalPayments.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    International Payments ({internationalPayments.length})
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
                        {internationalPayments.map((payment) => (
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
            )}
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
              
              <TextField
                label="Denial Reason (Optional)"
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="Add reason for denying this payment (optional)..."
                sx={{ mb: 2 }}
              />
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Close
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={handleApproveClick}
          >
            Approved
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<Cancel />}
            onClick={handleDenyClick}
          >
            Deny Payment
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => handleVerifyPayment('approve')}
          >
            Approve Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Deny Dialog */}
      <Dialog open={confirmDenyDialog} onClose={() => setConfirmDenyDialog(false)}>
        <DialogTitle>Confirm Payment Denial</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to deny this payment? This action cannot be undone.
          </Alert>
          {selectedPayment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Payment ID: <strong>{selectedPayment.id}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount: <strong>R{selectedPayment.amount.toFixed(2)}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recipient: <strong>{selectedPayment.recipientName}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDenyDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeny}
          >
            Confirm Deny
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Approve Dialog */}
      <Dialog open={confirmApproveDialog} onClose={() => setConfirmApproveDialog(false)}>
        <DialogTitle>Confirm Payment Approval</DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            Are you sure you want to approve this payment? This action cannot be undone.
          </Alert>
          {selectedPayment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Payment ID: <strong>{selectedPayment.id}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Amount: <strong>R{selectedPayment.amount.toFixed(2)}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recipient: <strong>{selectedPayment.recipientName}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmApproveDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmApprove}
          >
            Confirm Approve
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%', fontSize: '1rem' }}
          variant="filled"
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentVerification;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////