//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link, InputAdornment, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../utils/api';

const ForgotPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  //          
  // Watch password field for confirmation validation
  const watchPassword = watch('password', '');

  // Enhanced form validation rules
  const validationRules = {
    accountNumber: {
      required: 'Account number is required',
      pattern: {
        value: /^[0-9]{10,16}$/,
        message: 'Account number must be 10-16 digits only'
      }
    },
    idNumber: {
      required: 'ID number is required',
      pattern: {
        value: /^[0-9]{13}$/,
        message: 'ID number must be exactly 13 digits'
      }
    },
    password: {
      required: 'Password is required',
      minLength: {
        value: 12,
        message: 'Password must be at least 12 characters long'
      },
      maxLength: {
        value: 128,
        message: 'Password must be less than 128 characters'
      },
      pattern: {
        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,128}$/,
        message: 'Password must contain uppercase, lowercase, number, and special character (@$!%*?&)'
      }
    },
    confirmPassword: {
      required: 'Please confirm your password',
      validate: value => value === watchPassword || 'Passwords do not match'
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const sanitizedData = {
        accountNumber: data.accountNumber.trim().replace(/[^0-9]/g, ''),
        idNumber: data.idNumber.trim().replace(/[^0-9]/g, ''),
        password: data.password,
        confirmPassword: data.confirmPassword
      };

      const result = await authAPI.forgotPassword(sanitizedData);

      setSuccess(result.message);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

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
        
        <TextField
          placeholder="Account Number"
          variant="outlined"
          fullWidth
          disabled={loading}
          error={!!errors.accountNumber}
          helperText={errors.accountNumber?.message}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 4,
              border: 'none',
              '& fieldset': {
                border: errors.accountNumber ? '2px solid #f44336' : 'none',
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
          {...register('accountNumber', validationRules.accountNumber)}
          inputProps={{
            maxLength: 16,
            pattern: '[0-9]*',
            inputMode: 'numeric',
            autoComplete: 'username'
          }}
        />
        
        <TextField
          placeholder="ID Number (13 digits)"
          variant="outlined"
          fullWidth
          disabled={loading}
          error={!!errors.idNumber}
          helperText={errors.idNumber?.message}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 4,
              border: 'none',
              '& fieldset': {
                border: errors.idNumber ? '2px solid #f44336' : 'none',
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
          {...register('idNumber', validationRules.idNumber)}
          inputProps={{
            maxLength: 13,
            pattern: '[0-9]*',
            inputMode: 'numeric'
          }}
        />
        
        <TextField
          placeholder="Enter new password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          fullWidth
          disabled={loading}
          error={!!errors.password}
          helperText={errors.password?.message}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 4,
              border: 'none',
              '& fieldset': {
                border: errors.password ? '2px solid #f44336' : 'none',
              },
            },
            '& .MuiInputBase-input': {
              padding: '25px 25px',
              fontSize: '20px',
            },
            '& .MuiFormHelperText-root': {
              fontSize: '14px',
              marginTop: 1,
              marginLeft: 2,
            },
          }}
          {...register('password', validationRules.password)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={handleClickShowPassword}
                  disabled={loading}
                  sx={{ 
                    color: '#666',
                    minWidth: 'auto',
                    p: 1,
                    textTransform: 'none',
                    fontSize: '18px',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </InputAdornment>
            ),
          }}
          inputProps={{
            maxLength: 128,
            autoComplete: 'new-password'
          }}
        />
        
        <TextField
          placeholder="Confirm password"
          type={showConfirmPassword ? 'text' : 'password'}
          variant="outlined"
          fullWidth
          disabled={loading}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          sx={{
            mb: 5,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 4,
              border: 'none',
              '& fieldset': {
                border: errors.confirmPassword ? '2px solid #f44336' : 'none',
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
          {...register('confirmPassword', validationRules.confirmPassword)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Button
                  onClick={handleClickShowConfirmPassword}
                  disabled={loading}
                  sx={{ 
                    color: '#666',
                    minWidth: 'auto',
                    p: 1,
                    textTransform: 'none',
                    fontSize: '18px',
                  }}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </Button>
              </InputAdornment>
            ),
          }}
          inputProps={{
            maxLength: 128,
            autoComplete: 'new-password'
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
              Resetting Password...
            </Box>
          ) : (
            'Reset Password'
          )}
        </Button>
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography 
            sx={{ 
              color: 'black',
              fontSize: '18px',
            }}
          >
            Forgot Account ?{' '}
            <Link 
              component={RouterLink}
              to="/forgot-username"
              sx={{ 
                color: 'white',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '18px',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Click Here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////