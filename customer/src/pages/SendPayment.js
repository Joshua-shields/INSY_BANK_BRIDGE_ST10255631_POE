//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { ArrowBack, Send } from '@mui/icons-material';
import { customerAPI, utils } from '../utils/api';

/**
 * user enters recipient info → view  the submission before sending → MFA Verification asks to enter 6-digit OTP → Completion gives success confirmation
 *  */
//////////////////////////////////////////////////////////////////VARIABLES//////////////////////////////////////////////////////////////////
const SendPayment = ({ onBack }) => {
//////////////////////////////////////////////////////////////////VARIABLES//////////////////////////////////////////////////////////////////

  const [activeStep, setActiveStep] = useState(0);
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const steps = ['Payment Details', 'Review & Confirm', 'MFA Verification', 'Complete'];

  //handle form submission based on current step
  const onSubmit = async (data) => {
    if (activeStep === 0) {
      //step 1: set the payment data and move to review section
      setPaymentData(data);
      setActiveStep(1);
    } else if (activeStep === 1) {
      //step 2: move to MFA verification
      setActiveStep(2);
    } else if (activeStep === 2) {
      //step 3: submit payment with MFA verification
      setLoading(true);
      setError(null);
      try {
        const response = await customerAPI.sendPayment(paymentData);
        setTransactionId(response.transaction.id);
        setActiveStep(3); 
      } catch (err) {
        setError(utils.handleApiError(err));
      } finally {
        setLoading(false);
      }
    }
  };

  //verifies OTP and submit payment
  const handleVerifyOtp = async () => {
    //validates OTP code
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      // Submit payment to backend
      const response = await customerAPI.sendPayment(paymentData);
      setTransactionId(response.transaction.id);
      setActiveStep(3); 
    } catch (err) {
      setError(utils.handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // go back to previous step or dashboard
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    } else {
      onBack(); //return to dashboard
    }
  };

  // Render content based on current step
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              {/* Recipient Account Number */}
              <Grid item xs={12}>
                <TextField
                  label="Recipient Account Number"
                  fullWidth
                  {...register('recipientAccount', { 
                    required: 'Account number is required',
                    pattern: {
                      value: /^\d{10,16}$/,
                      message: 'Account number must be 10-16 digits'
                    }
                  })}
                  error={!!errors.recipientAccount}
                  helperText={errors.recipientAccount?.message}
                />
              </Grid>
              {/* Recipient's Name */}
              <Grid item xs={12}>
                <TextField
                  label="Recipient Name"
                  fullWidth
                  {...register('recipientName', { 
                    required: 'Recipient name is required' 
                  })}
                  error={!!errors.recipientName}
                  helperText={errors.recipientName?.message}
                />
              </Grid>
              {/* transaction amount Field */}
              <Grid item xs={12} sm={6}>
                 <TextField
                   label="Amount"
                   type="number"
                   fullWidth
                   inputProps={{ min: 0.01, step: 0.01 }}
                   {...register('amount', { 
                     required: 'Amount is required',
                     min: { value: 0.01, message: 'Amount must be greater than 0' },
                     valueAsNumber: true  // Convert to number
                   })}
                   error={!!errors.amount}
                   helperText={errors.amount?.message}
                 />
              </Grid>
              {/* SWIFT Code Field */}
               <Grid item xs={12} sm={6}>
                 <TextField
                   label="SWIFT Code"
                   fullWidth
                   {...register('swiftCode', { 
                     required: 'SWIFT code is required',
                     pattern: {
                       value: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
                       message: 'SWIFT code must be a valid BIC format (8 or 11 characters)'
                     }
                   })}
                   error={!!errors.swiftCode}
                   helperText={errors.swiftCode?.message}
                 />
               </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Reference/Description"
                  fullWidth
                  multiline
                  rows={3}
                  {...register('reference', { 
                    required: 'Reference is required' 
                  })}
                  error={!!errors.reference}
                  helperText={errors.reference?.message}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" variant="contained">
                    Review Payment
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        );

      case 1:
        return (
          <Box>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Alert severity="info" sx={{ mb: 3 }}>
              Please review your payment details carefully before confirming.
            </Alert>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Payment Summary</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Recipient</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paymentData?.recipientName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Account Number</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paymentData?.recipientAccount}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Amount</Typography>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  ${paymentData?.amount}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">SWIFT Code</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paymentData?.swiftCode || 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Reference</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {paymentData?.reference}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button variant="outlined" onClick={handleBack} disabled={loading}>
                    Back
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleSubmit(onSubmit)}
                    startIcon={<Send />}
                  >
                    Continue to MFA
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        //MFA Verification
        return (
          <Box>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
            <Alert severity="info" sx={{ mb: 3 }}>
              Enter the 6-digit code from your authenticator app
            </Alert>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>MFA Verification</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              {/* OTP Input Field */}
              <Grid item xs={12}>
                <TextField
                  label="OTP Code"
                  fullWidth
                  value={otpCode}
                  onChange={(e) => {
                    // Only allows digits with a maximum of 6 characters
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) setOtpCode(value);
                  }}
                  placeholder="000000"
                  inputProps={{ 
                    maxLength: 6,
                    style: { fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }
                  }}
                />
              </Grid>
              {/* Verification Buttons */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                  <Button variant="outlined" onClick={handleBack} disabled={loading}>
                    Back
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleVerifyOtp}
                    startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? 'Verifying...' : 'Verify & Send Payment'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        );

      case 3:
        // Payment Completion
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Payment sent successfully!
            </Alert>
            <Typography variant="h5" gutterBottom>
              Payment Completed
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Your payment of ${paymentData?.amount} to {paymentData?.recipientName} has been processed.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Transaction ID: {transactionId}
            </Typography>
            {/* Return to Dashboard Button */}
            <Button variant="contained" onClick={onBack}>
              Back to Dashboard
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #ff9800 0%, #2196f3 100%)', p: 3 }}>
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button 
              startIcon={<ArrowBack />} 
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            <Typography variant="h5" fontWeight="bold">
              Send Payment
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SendPayment;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////