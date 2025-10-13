//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
/**
 * // Importing API utilities
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Container,
  Alert,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { customerAPI, utils } from '../utils/api';

/*
handles local bank transfers with form validation, multi-factor authentication and submission through a backend API
*/

const LocalTransactions = () => {
  /**
   * default states for form data
   */
  const navigate = useNavigate();

  // Form data state for storing recipient details
  const [formData, setFormData] = useState({
    name: '',
    accountNumber: '',
    amount: '',
    date: '',
    bank: '',
  });
  /**
   * Loading the states of the form submission
   */
  const [loading, setLoading] = useState(false);      
  const [error, setError] = useState(null);            //error messages
  const [success, setSuccess] = useState(false);       //success flag
  const [showMFA, setShowMFA] = useState(false);       //toggle MFA screen
  const [otpCode, setOtpCode] = useState('');          //MFA OTP code
  const [qrCode, setQrCode] = useState(null);          //MFA QR code image
  const [mfaSecret, setMfaSecret] = useState(null);    //MFA manual entry code
  const [mfaAlreadySetup, setMfaAlreadySetup] = useState(false); // MFA setup status

  //check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Silent check
    }
  }, []);

  const handleInputChange = (field) => (e) => {
    let value = e.target.value;
    
    // Input sanitization and validation based on field type
    if (field === 'name') {
      // Only allow letters and spaces for name field (XSS protection)
      value = value.replace(/[^a-zA-Z\s]/g, '');
      // Limit to 50 characters
      if (value.length > 50) value = value.substring(0, 50);
    } else if (field === 'accountNumber') {
      // Only allow digits for account number
      value = value.replace(/\D/g, '');
      // Limit to 16 digits
      if (value.length > 16) value = value.substring(0, 16);
    } else if (field === 'amount') {
      // Only allow numbers and decimal point
      value = value.replace(/[^\d.]/g, '');
      // Ensure only one decimal point
      const parts = value.split('.');
      if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      // Limit decimal places to 2
      if (parts.length === 2 && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
      }
    }
    
    //updates the form state
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear specific errors when user starts correcting
    if (field === 'accountNumber' && error?.includes('Account number')) {
      setError(null);
    } else if (field === 'name' && error?.includes('Name')) {
      setError(null);
    } else if (field === 'amount' && error?.includes('amount')) {
      setError(null);
    } else if (error) {
      setError(null);
    }
  };

  // check the form before submission
  const validateForm = () => {
    // Name validation with security checks
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (formData.name.length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      setError('Name must contain only letters and spaces');
      return false;
    }
    
    // Account number validation with security checks
    if (!formData.accountNumber.trim()) {
      setError('Account number is required');
      return false;
    }
    const accountNumberDigits = formData.accountNumber.replace(/\D/g, '');
    if (accountNumberDigits.length < 10 || accountNumberDigits.length > 16) {
      setError('Account number must be 10-16 digits');
      return false;
    }
    
    // Amount validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0');
      return false;
    }
    if (parseFloat(formData.amount) > 1000000) {
      setError('Amount cannot exceed 1,000,000');
      return false;
    }
    
    // Date validation
    if (!formData.date) {
      setError('Date is required');
      return false;
    }
    
    //Date validation only allows today and up to 5 days in the future
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(today.getDate() + 5);
    
    if (selectedDate < today) {
      setError('Transaction date cannot be in the past');
      return false;
    }
    if (selectedDate > fiveDaysFromNow) {
      setError('Transaction date cannot be more than 5 days in the future');
      return false;
    }
    
    // Bank validation
    if (!formData.bank) {
      setError('Bank is required');
      return false;
    }
    
    // returns when all validations passed
    return true;
  };
  //triggers the transfer process
  const handleTransfer = async () => {
    const token = localStorage.getItem('authToken');
    const accountNumber = localStorage.getItem('accountNumber');
    
    //checks if user is authenticated with token
    if (!token) {
      setError('You must be logged in to make a transfer. Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }
    
    if (!accountNumber) {
      setError('Account information not found. Please log out and log in again.');
      return;
    }
    
    // Validate form data
    if (!validateForm()) {
      return;
    }
    
    try {
      // Setup MFA for transaction
      const mfaData = await customerAPI.setupMFA(accountNumber);
      
      if (mfaData.alreadySetup) {
        
        setMfaAlreadySetup(true);
        setQrCode(null);
        setMfaSecret(null);
      } else {
        // First time MFA setup - show QR code
        setMfaAlreadySetup(false);
        setQrCode(mfaData.qrCode);
        setMfaSecret(mfaData.secret);
      }
      
      // Show MFA verification screen
      setShowMFA(true);
    } catch (err) {
      setError(`Failed to setup MFA: ${err.response?.data?.error || err.message}`);
    }
  };
//Handles the verification and transfer process
  const handleVerifyAndTransfer = async () => {
    // Validate OTP code
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare payment data for local transactions
      const paymentData = {
        recipientName: formData.name,
        accountNumber: formData.accountNumber,
        amount: parseFloat(formData.amount),
        bank: formData.bank,
        name: formData.name,
        date: formData.date,
        otpToken: otpCode
      };
      
      // Use the dedicated local transfer endpoint
      const response = await customerAPI.localTransfer(paymentData);
      
      // Show success message
      setSuccess(true);
      setShowMFA(false);
      
      // Redirect to dashboard after 5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 5000);
      
    } catch (err) {
      // Handle errors
      if (err.response?.status === 401) {
        setError('Invalid OTP code. Please enter the current 6-digit code from your authenticator app.');
      } else {
        setError(utils.handleApiError(err));
      }
    } finally {
      setLoading(false);
    }
  };
//handles the submit event
  const onSubmit = (e) => {
    e.preventDefault();  // Prevent page reload
    handleTransfer();    
  };
// JSX for the component, determines whether to show the form or MFA verification
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff9800 0%, #2196f3 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      {/* Cancel button redirects to dashboard */}
      <Button
        variant="contained"
        onClick={() => navigate('/dashboard')}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          backgroundColor: '#ff4444',
          color: 'white',
          fontWeight: 'bold',
          px: 3,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#cc0000',
          },
        }}
      >
        Cancel Transaction
      </Button>
      <Container maxWidth="sm">
        <Card
          sx={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: 3,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                }}
              >
                <img
                  src="/bank bridge logo.png"
                  alt="BankBridge"
                  style={{ width: '60px', height: 'auto' }}
                />
              </Box>
            </Box>

            {/* Title */}
            <Typography
              variant="h5"
              align="center"
              fontWeight="bold"
              gutterBottom
              sx={{ mb: 4 }}
            >
              Transactions
            </Typography>

            {/* Success Alert */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Payment submitted successfully! Your payment is pending approval and will be processed shortly.
              </Alert>
            )}

            {/* Error Alert */}
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Conditional rendering: Show MFA screen or transaction form */}
            {showMFA ? (
              // MFA Verification Screen
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  MFA Verification
                </Typography>
                {/* Instructions based on MFA setup status */}
                <Alert severity="info">
                  {mfaAlreadySetup 
                    ? 'Enter the 6-digit code from your authenticator app to authorize this transaction'
                    : qrCode 
                      ? 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code. If you have already scanned the QR code, please enter the OTP code from your auth app.' 
                      : 'Enter the 6-digit code from your authenticator app'}
                </Alert>
                {/* Display QR code for first-time MFA setup */}
                {!mfaAlreadySetup && qrCode && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <img src={qrCode} alt="MFA QR Code" style={{ width: 250, height: 250 }} />
                    <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      Or enter this code manually: <strong>{mfaSecret}</strong>
                    </Typography>
                  </Box>
                )}
                {/* OTP input field */}
                <TextField
                  label="OTP Code"
                  fullWidth
                  variant="outlined"
                  value={otpCode}
                  onChange={(e) => {
                    // Only allow digits, max 6 characters
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= 6) setOtpCode(value);
                  }}
                  placeholder="000000"
                  inputProps={{ 
                    maxLength: 6,
                    style: { fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e8e8e8',
                      borderRadius: 2,
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                  }}
                />
                {/* Action buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                   {/* Back button - return to form */}
                   <Button
                     variant="outlined"
                     onClick={() => {
                       setShowMFA(false);
                       setOtpCode('');
                       setError(null);
                     }}
                     disabled={loading}
                     sx={{ 
                       px: 4,
                       borderColor: '#333',
                       color: '#333',
                     }}
                   >
                     Back
                   </Button>
                   {/* Verify and submit button */}
                   <Button
                     variant="contained"
                     onClick={handleVerifyAndTransfer}
                     disabled={loading || otpCode.length !== 6}
                     sx={{
                       backgroundColor: '#333',
                       color: 'white',
                       fontWeight: 'bold',
                       px: 6,
                       '&:hover': {
                         backgroundColor: '#555',
                       },
                     }}
                   >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Send Payment'
                    )}
                  </Button>
                </Box>
              </Box>
            ) : (
              // Transaction Form
              <form onSubmit={onSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {/* Name Field */}
                <TextField
                  placeholder="Recipient Name"
                  label="Recipient Name"
                  fullWidth
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  error={formData.name && (formData.name.length < 2 || !/^[a-zA-Z\s]+$/.test(formData.name))}
                  helperText={
                    formData.name && formData.name.length < 2 
                      ? 'Name must be at least 2 characters' 
                      : formData.name && !/^[a-zA-Z\s]+$/.test(formData.name)
                      ? 'Only letters and spaces allowed'
                      : 'Enter recipient\'s full name (letters only)'
                  }
                  inputProps={{ maxLength: 50 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e8e8e8',
                      borderRadius: 2,
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px 20px',
                      fontSize: '16px',
                    },
                  }}
                />

                {/* Account Number Field */}
                <TextField
                  placeholder="Account Number"
                  label="Account Number"
                  fullWidth
                  variant="outlined"
                  value={formData.accountNumber}
                  onChange={handleInputChange('accountNumber')}
                  error={formData.accountNumber && (formData.accountNumber.replace(/\D/g, '').length < 10 || formData.accountNumber.replace(/\D/g, '').length > 16)}
                  helperText={
                    formData.accountNumber && (formData.accountNumber.replace(/\D/g, '').length < 10 || formData.accountNumber.replace(/\D/g, '').length > 16)
                      ? 'Account number must be 10-16 digits'
                      : 'Enter recipient\'s account number (10-16 digits)'
                  }
                  inputProps={{ maxLength: 16, inputMode: 'numeric' }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e8e8e8',
                      borderRadius: 2,
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px 20px',
                      fontSize: '16px',
                    },
                  }}
                />

                {/* Amount Field */}
                <TextField
                  placeholder="Amount"
                  label="Amount"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.amount}
                  onChange={handleInputChange('amount')}
                  error={formData.amount && (parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > 1000000)}
                  helperText={
                    formData.amount && parseFloat(formData.amount) <= 0
                      ? 'Amount must be greater than 0'
                      : formData.amount && parseFloat(formData.amount) > 1000000
                      ? 'Amount cannot exceed 1,000,000'
                      : 'Enter transaction amount (max: 1,000,000)'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e8e8e8',
                      borderRadius: 2,
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px 20px',
                      fontSize: '16px',
                    },
                  }}
                />

                {/* Date Field */}
                <TextField
                  placeholder="Transaction Date"
                  label="Transaction Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  value={formData.date}
                  onChange={handleInputChange('date')}
                  inputProps={{
                    min: new Date().toISOString().split('T')[0], // Prevent past dates
                    max: (() => {
                      const maxDate = new Date();
                      maxDate.setDate(maxDate.getDate() + 5);
                      return maxDate.toISOString().split('T')[0];
                    })(), // Allow up to 5 days in the future
                  }}
                  error={formData.date && (new Date(formData.date) < new Date().setHours(0, 0, 0, 0) || new Date(formData.date) > (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d; })())}
                  helperText={
                    formData.date && new Date(formData.date) < new Date().setHours(0, 0, 0, 0)
                      ? 'Date cannot be in the past'
                      : formData.date && new Date(formData.date) > (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d; })()
                      ? 'Date cannot be more than 5 days in the future'
                      : 'Select transaction date (today to 5 days in the future)'
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e8e8e8',
                      borderRadius: 2,
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px 20px',
                      fontSize: '16px',
                      color: '#666',
                    },
                  }}
                />

                {/* Bank Field */}
                <TextField
                  placeholder="Select Bank"
                  label="Recipient's Bank"
                  fullWidth
                  variant="outlined"
                  select
                  value={formData.bank}
                  onChange={handleInputChange('bank')}
                  helperText="Select the recipient's bank"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#e8e8e8',
                      borderRadius: 2,
                      '& fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '16px 20px',
                      fontSize: '16px',
                    },
                  }}
                >   {/* Bank selection options */}
                  <MenuItem value="Absa">Absa</MenuItem>
                  <MenuItem value="FNB">FNB</MenuItem>
                  <MenuItem value="Standard Bank">Standard Bank</MenuItem>
                  <MenuItem value="Nedbank">Nedbank</MenuItem>
                  <MenuItem value="Capitec Bank">Capitec Bank</MenuItem>
                  <MenuItem value="Investec">Investec</MenuItem>
                  <MenuItem value="Discovery Bank">Discovery Bank</MenuItem>
                  <MenuItem value="African Bank">African Bank</MenuItem>
                  <MenuItem value="Bidvest Bank">Bidvest Bank</MenuItem>
                  <MenuItem value="TymeBank">TymeBank</MenuItem>
                </TextField>

                {/* Submit Button */}
                 <Button
                   type="submit"
                   variant="contained"
                   fullWidth
                   disabled={loading || success}
                   sx={{
                     mt: 2,
                     backgroundColor: '#333',
                     color: 'white',
                     borderRadius: 3,
                     py: 2,
                     textTransform: 'none',
                     fontSize: '18px',
                     fontWeight: 'bold',
                     boxShadow: '0 4px 12px rgba(51, 51, 51, 0.3)',
                     '&:hover': {
                       backgroundColor: '#555',
                       boxShadow: '0 6px 16px rgba(51, 51, 51, 0.4)',
                     },
                   }}
                 >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                      Processing...
                    </>
                  ) : success ? (
                    'Transaction Saved'
                  ) : (
                     'Transfer'
                  )}
                </Button>
               </Box>
            </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LocalTransactions;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////