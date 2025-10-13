//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Avatar,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { customerAPI, utils } from '../utils/api';

const TransactionTransferContinuedC5 = ({ onBack }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    accountHolderName: '',
    accountNumber: '',
    bank: '',
    swiftCode: '',
    amount: '',
  });
  const [immediatePayment, setImmediatePayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [mfaSecret, setMfaSecret] = useState(null);
  const [mfaAlreadySetup, setMfaAlreadySetup] = useState(false);

  // Check authentication on component mount - but don't redirect immediately
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // Silent check
    }
  }, []);
  /**
   * the below methood contains the functionality for the input changes acception. 
   * 
   * should an error arise for the  aame innput, an error message shall display and display the errpr
   * 
   * should the Error asrise regarding the account holder name, an error message shall display and display the errpr mesaage 
   * 
   * should the   Error asrise regarding the account number, an error message shall display and display the errpr mesaage
   * 
   * should the   Error asrise regarding the bank, an error message shall display and display the errpr mesaage
   * 
   * should the   Error asrise regarding the amount, an error message shall display and display the errpr mesaage
   * 
   * should the   Error asrise regarding the swift code, an error message shall display and display the errpr mesaage
   * 
   * 
  */
  const handleInputChange = (field) => (e) => {
    setFormData({
      ...formData,
      [field]: e.target.value,
    });
    if (error) {
      if (field === 'name' && (error.includes('Name is required') || error.includes('Name must contain'))) {
        setError(null);
      }
      if (field === 'accountHolderName' && (error.includes('Account holder name is required') || error.includes('Account holder name must contain'))) {
        setError(null);
      }
      if (field === 'accountNumber' && error.includes('Account number')) {
        setError(null);
      }
      if (field === 'bank' && error.includes('Bank is required')) {
        setError(null);
      }
      if (field === 'amount' && error.includes('Please enter a valid amount')) {
        setError(null);
      }
      if (field === 'swiftCode' && error.includes('SWIFT')) {
        setError(null);
      }
    }
  };
    /**
     * the below code contains the validation regairding the information  validation located o the form
     * 
     * this ensure that iformation is sanitized and valid before being sent to the backend
     * 
     * theinformatiion is checked for matchin characters for each field
     * 
     * name will only accept alphebets in either lowercase or upper case
     * 
     * account holder name will only accept alphebets in either lowercase or upper case and is a required field
     * 
     * account number is reqiored and shall on;y accept numbers with only decimal numbers accepted 
     * 
     * the bank  input is whitelisted so a user caan only select from predifed south african banks 
     * 
     * the rtransfer amount need to be uder 1 million  and only accepts positive values 
     * 
     * the swift code will only accept valid swift code format, in upper case and reqires a minimum of 8 charcters and a max of 11 characters
     * 
     * 
     * **/ 
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      setError('Name must contain only letters and spaces');
      return false;
    }
    if (!formData.accountHolderName.trim()) {
      setError('Account holder name is required');
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.accountHolderName.trim())) {
      setError('Account holder name must contain only letters and spaces');
      return false;
    }
    if (!formData.accountNumber.trim()) {
      setError('Account number is required');
      return false;
    }
    const accountNumberDigits = formData.accountNumber.replace(/\D/g, '');
    if (!/^[0-9]{10,16}$/.test(accountNumberDigits)) {
      setError('Account number must be 10-16 digits only');
      return false;
    }
    if (!formData.bank) {
      setError('Bank is required');
      return false;
    }
     if (!formData.amount || parseFloat(formData.amount) <= 0) {
       setError('Please enter a valid amount');
       return false;
     }
    if (parseFloat(formData.amount) > 1000000) {
      setError('Amount cannot exceed 1,000,000');
      return false;
    }
    if (!formData.swiftCode || !formData.swiftCode.trim()) {
      setError('SWIFT code is required');
      return false;
    }
    if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(formData.swiftCode)) {
      setError('SWIFT code must be a valid BIC format (8 or 11 characters)');
      return false;
    }
    return true;
  };
/**
 * 
 * The below code contains the functionality for handling the transfer process
 * 
 * sould a user not be logged in, an error message shall display and the user will be redirected to the login page
 * 
 * should the account information not be found, an error message shall display and the user will be advised to log out and log in again
 * 
 * should a valid token and account information be found, the form will be validated 
 * 
 * 
 */
  const handleTransfer = async () => {
    const token = localStorage.getItem('authToken');
    const accountNumber = localStorage.getItem('accountNumber');
    
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
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const mfaData = await customerAPI.setupMFA(accountNumber);
      
      setMfaAlreadySetup(mfaData.mfaEnabled);
      setQrCode(mfaData.qrCode || null);
      setMfaSecret(mfaData.secret || null);
      setShowMFA(true);
    } catch (err) {
      setError(`Failed to setup MFA: ${err.response?.data?.error || err.message}`);
    }
  };
  //**
  // the below code contains the functionality for handling the verification and transfer process
  // 
  // should the otp code not be valid, an error message shall display and the user will be advised to enter a valid otp code
  const handleVerifyAndTransfer = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const paymentData = {
        recipientAccount: formData.accountNumber,
        recipientName: formData.accountHolderName,
        amount: parseFloat(formData.amount),
        swiftCode: formData.swiftCode || '',
        bank: formData.bank,
        name: formData.name,
        otpToken: otpCode,
        immediatePayment: immediatePayment
      };
      
      const response = await customerAPI.transfer(paymentData);
      
      setSuccess(true);
      setShowMFA(false);
      
      /**
       * below is the timeout set for 1 hour 
       * 
       * this will redirect the user to the dashboard after 2 seconds
       * 
      */
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
      /**
       * below is the error essage error 401 should a user be timed  out 
       * 
       * this will prompt the user to re enter their otp code
       */
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid OTP code. Please enter the current 6-digit code from your authenticator app.');
      } else {
        setError(utils.handleApiError(err));
      }
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ff9800 0%, #2196f3 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 6,
        px: 2,
        position: 'relative',
      }}
    >
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

      {/**  Logo and Title
       * the below code contains the logo and title of the form
       */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 100,
            height: 100,
            margin: '0 auto',
            mb: 2,
            backgroundColor: 'white',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: '#000',
              fontWeight: 'bold',
              fontSize: '14px',
              textAlign: 'center',
              px: 1,
            }}
          >
            BankBridge
          </Typography>
        </Avatar>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            color: '#000',
          }}
        >
          Transactions
        </Typography>
      </Box>

      {/**  Form Card
       * the below code contains the card that holds the form inputs
       * 
       * the card is styled to be responsive and user friendly
       * 
       */}
      <Card
        sx={{
          width: '100%',
          maxWidth: 900,
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Payment submitted successfully! Your payment is pending approval and will be processed shortly.
            </Alert>
          )}
          
          {showMFA ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                MFA Verification
              </Typography>
              <Alert severity="info">
                {mfaAlreadySetup 
                  ? 'Enter the 6-digit code from your authenticator app to authorize this transaction'
                  : qrCode 
                    ? 'Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code. If you have already scanned the QR code, please enter the OTP code from your auth app.' 
                    : 'Enter the 6-digit code from your authenticator app'}
              </Alert>
              {!mfaAlreadySetup && qrCode && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <img src={qrCode} alt="MFA QR Code" style={{ width: 250, height: 250 }} />
                  <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                    Or enter this code manually: <strong>{mfaSecret}</strong>
                  </Typography>
                </Box>
              )}
              <TextField
                label="OTP Code"
                fullWidth
                variant="filled"
                value={otpCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) setOtpCode(value);
                }}
                placeholder="000000"
                inputProps={{ 
                  maxLength: 6,
                  style: { fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }
                }}
                sx={{
                  backgroundColor: '#d3d3d3',
                  '& .MuiFilledInput-root': {
                    backgroundColor: '#d3d3d3',
                  },
                }}
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowMFA(false);
                    setOtpCode('');
                    setError(null);
                  }}
                  disabled={loading}
                  sx={{ px: 4 }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleVerifyAndTransfer}
                  disabled={loading || otpCode.length !== 6}
                  sx={{
                    backgroundColor: '#7CB4F5',
                    color: '#000',
                    fontWeight: 'bold',
                    px: 6,
                    '&:hover': {
                      backgroundColor: '#6AA3E4',
                    },
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: '#000' }} />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Send Payment'
                  )}
                </Button>
              </Box>
            </Box>
          ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/**  Name
             * the below code contains the input field for the name
             * this is a required field and only accepts letters in either lowercase or uppercase
             * should an error arise, an error message shall display and the user will be advised to only use letters
             */}
            <TextField
              label="Name"
              fullWidth
              variant="filled"
              value={formData.name}
              onChange={handleInputChange('name')}
              sx={{
                backgroundColor: '#d3d3d3',
                '& .MuiFilledInput-root': {
                  backgroundColor: '#d3d3d3',
                  '&:hover': {
                    backgroundColor: '#d3d3d3',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#d3d3d3',
                  },
                },
              }}
            />

            {/**  Account Holder Name 
             * this is a required field and only accepts letters in either lowercase or uppercase
             * should an error arise, an error message shall display and the user will be advised to only use letters
            */}
            <TextField
              label="Account holder name"
              fullWidth
              variant="filled"
              value={formData.accountHolderName}
              onChange={handleInputChange('accountHolderName')}
              sx={{
                backgroundColor: '#d3d3d3',
                '& .MuiFilledInput-root': {
                  backgroundColor: '#d3d3d3',
                  '&:hover': {
                    backgroundColor: '#d3d3d3',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#d3d3d3',
                  },
                },
              }}
            />

            {/**  Account Number
             * the below code contains the input field for the account number
             * this field only accepts numbers and is a required field
             */}
            <TextField
              label="account number"
              fullWidth
              variant="filled"
              value={formData.accountNumber}
              onChange={handleInputChange('accountNumber')}
              helperText="Must be 10-16 digits"
              error={formData.accountNumber && (formData.accountNumber.replace(/\D/g, '').length < 10 || formData.accountNumber.replace(/\D/g, '').length > 16)}
              sx={{
                backgroundColor: '#d3d3d3',
                '& .MuiFilledInput-root': {
                  backgroundColor: '#d3d3d3',
                  '&:hover': {
                    backgroundColor: '#d3d3d3',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#d3d3d3',
                  },
                },
              }}
            />

            {/**  Bank
             * the below code contains the input field for the bank and is a required field
             */}
            <TextField
              label="BANK"
              fullWidth
              variant="filled"
              select
              value={formData.bank}
              onChange={handleInputChange('bank')}
              sx={{
                backgroundColor: '#d3d3d3',
                '& .MuiFilledInput-root': {
                  backgroundColor: '#d3d3d3',
                  '&:hover': {
                    backgroundColor: '#d3d3d3',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#d3d3d3',
                  },
                },
              }}
            >
               {/**
                * the below code is for the whitelisting of south african banks containing all major banks 
                * this is to ensure that a user can only select from the predifined banks
                * this is to prevent any errors regarding bank names and to ensure that the swift codes are valid for the selected banks 
                * should a user attempt to input their own bank name, an error message shall display and the user will be advised to select from the list 
                * 
                * this provides security against fraud 
                * 
                */}
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

            {/** 
             * the below code contains the input field for the swift code
             * 
             * this can only accept swift formats in all caps 
             * the swift is aa required field and a user cannont proceed without entering a valid swift code
            */}
            <TextField
              label="Swift code"
              fullWidth
              variant="filled"
              value={formData.swiftCode}
              onChange={handleInputChange('swiftCode')}
              placeholder="SBZAZAJJ"
              helperText="8-11 uppercase characters (e.g., SBZAZAJJ)"
              sx={{
                backgroundColor: '#d3d3d3',
                '& .MuiFilledInput-root': {
                  backgroundColor: '#d3d3d3',
                  '&:hover': {
                    backgroundColor: '#d3d3d3',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#d3d3d3',
                  },
                },
              }}
            />

             {/**
              * the below code contains the input field for the transfer amount
              * 
              * the amount is validated to ensure that it is a positive value and does not exceed 1 million 
              * 
              * this enures that users do not add invalid amounts by accident or on purpose
              */}
             <TextField
               label="Amount"
               fullWidth
               variant="filled"
               value={formData.amount}
               onChange={handleInputChange('amount')}
               type="number"
               helperText="Enter transaction amount (max: 1,000,000)"
               sx={{
                 backgroundColor: '#d3d3d3',
                 '& .MuiFilledInput-root': {
                   backgroundColor: '#d3d3d3',
                   '&:hover': {
                     backgroundColor: '#d3d3d3',
                   },
                   '&.Mui-focused': {
                     backgroundColor: '#d3d3d3',
                   },
                 },
               }}
             />

            {/**  Transfer Button and Immediate Payment Toggle
             * 
             * the below code has the functionality for the toggle and transfer button
             */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mt: 2,
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Button
                variant="contained"
                onClick={handleTransfer}
                disabled={loading || success}
                sx={{
                  backgroundColor: '#7CB4F5',
                  color: '#000',
                  fontWeight: 'bold',
                  px: 6,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '16px',
                  '&:hover': {
                    backgroundColor: '#6AA3E4',
                  },
                  minWidth: 200,
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1, color: '#000' }} />
                    Processing...
                  </>
                ) : success ? (
                  'Payment Submitted'
                ) : (
                  'Transfer'
                )}
              </Button>

              <FormControlLabel
                control={
                  <Switch
                    checked={immediatePayment}
                    onChange={(e) => setImmediatePayment(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#000',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#000',
                      },
                    }}
                  />
                }
                label="Immediate payment"
                sx={{
                  '& .MuiFormControlLabel-label': {
                    fontWeight: 'bold',
                    color: '#000',
                  },
                }}
              />
            </Box>
          </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default TransactionTransferContinuedC5;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////