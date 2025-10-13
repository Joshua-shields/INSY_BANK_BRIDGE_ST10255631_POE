//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import React, { useState } from 'react';
import { Box, TextField, Button, Alert, CircularProgress, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { authAPI } from '../utils/api';

const ForgotUsername = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Enhanced form validation rules
  const validationRules = {
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: 'Please enter a valid email address'
      }
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setUserInfo(null);

    try {
      const sanitizedEmail = data.email.trim().toLowerCase();
      const result = await authAPI.forgotUsername(sanitizedEmail);
      
      setSuccess(result.message);
      setUserInfo({
        accountNumber: result.accountNumber,
        name: result.name,
        note: result.note
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #ff9800 0%, #2196f3 100%)',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: 150,
          height: 150,
          borderRadius: '50%',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 5,
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        }}
      >
        <img 
          src="/bank bridge logo.png" 
          alt="BankBridge" 
          style={{ width: '100px', height: 'auto' }}
        />
      </Box>

      <Box sx={{ width: 600 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 4 }}>
            {error}
          </Alert>
        )}
        
        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 4 }}>
            {success}
          </Alert>
        )}

        {/* User Info Display */}
        {userInfo && (
          <Box sx={{ 
            mb: 3, 
            p: 3, 
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 4,
            border: '2px solid #4caf50'
          }}>
            <Typography sx={{ fontSize: '18px', fontWeight: 'bold', mb: 1 }}>
              Account Found:
            </Typography>
            <Typography sx={{ fontSize: '16px', mb: 1 }}>
              Name: {userInfo.name}
            </Typography>
            <Typography sx={{ fontSize: '16px', mb: 1 }}>
              Account Number: {userInfo.accountNumber}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
              {userInfo.note}
            </Typography>
          </Box>
        )}
        
        <TextField
          placeholder="Enter Email for Account Recovery"
          variant="outlined"
          fullWidth
          disabled={loading}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{
            mb: 5,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 4,
              border: 'none',
              '& fieldset': {
                border: errors.email ? '2px solid #f44336' : 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: '25px 25px',
              fontSize: '20px',
            },
            '& .MuiFormHelperText-root': {
              fontSize: '16px',
              marginTop: 1,
              marginLeft: 2,
            },
          }}
          {...register('email', validationRules.email)}
          inputProps={{
            maxLength: 255,
            autoComplete: 'email'
          }}
        />
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          onClick={handleSubmit(onSubmit)}
           sx={{
              backgroundColor: loading ? '#666' : '#333',
              color: 'white',
              borderRadius: 4,
              py: 3.5,
              mb: 3,
              textTransform: 'none',
              fontSize: '22px',
              fontWeight: 'bold',
              position: 'relative',
              '&:hover': {
                backgroundColor: loading ? '#666' : '#555',
              },
              '&:disabled': {
                color: 'white',
              },
            }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={24} sx={{ color: 'white', mr: 2 }} />
              Finding Account...
            </Box>
          ) : (
            'Find Account'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ForgotUsername;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////