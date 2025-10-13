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
  Alert,
} from '@mui/material';
import { CheckCircle, Cancel, Visibility } from '@mui/icons-material';
import NavigationBar from '../components/NavigationBar';

const PaymentVerification = ({ onNavigate, onLogout, employee }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [verificationNote, setVerificationNote] = useState('');

  const [payments, setPayments] = useState([
    {
      id: 'PAY001',
      customerName: 'John Doe',
      customerAccount: '1234567890',
      recipientName: 'Jane Smith',
      recipientAccount: '2345678901',
      amount: 1250.00,
      reference: 'Monthly rent payment',
      date: '2025-09-23',
      status: 'Pending',
      swiftCode: 'ABCD1234',
    },
    {
      id: 'PAY002',
      customerName: 'Bob Wilson',
      customerAccount: '3456789012',
      recipientName: 'ABC Corporation',
      recipientAccount: '4567890123',
      amount: 10000.00,
      reference: 'Large business payment',
      date: '2025-09-23',
      status: 'Pending',
      swiftCode: 'EFGH5678',
    },
    {
      id: 'PAY003',
      customerName: 'Alice Johnson',
      customerAccount: '5678901234',
      recipientName: 'Tom Brown',
      recipientAccount: '6789012345',
      amount: 500.75,
      reference: 'Loan repayment',
      date: '2025-09-22',
      status: 'Pending',
      swiftCode: '',
    },
  ]);

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPayment(null);
    setVerificationNote('');
  };

  const handleVerifyPayment = (action) => {
    if (selectedPayment) {
      setPayments(prev => 
        prev.map(payment => 
          payment.id === selectedPayment.id 
            ? { ...payment, status: action === 'approve' ? 'Approved' : 'Rejected' }
            : payment
        )
      );
      handleCloseDialog();
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
                          ${payment.amount.toFixed(2)}
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
      </Box>

      {/* Payment Review Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Payment Review - {selectedPayment?.id}
        </DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <>
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
                    value={`$${selectedPayment.amount.toFixed(2)}`}
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
                label="Verification Notes"
                multiline
                rows={3}
                fullWidth
                value={verificationNote}
                onChange={(e) => setVerificationNote(e.target.value)}
                placeholder="Add any notes about this payment verification..."
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => handleVerifyPayment('reject')}
          >
            Reject
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
            onClick={() => handleVerifyPayment('approve')}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentVerification;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////