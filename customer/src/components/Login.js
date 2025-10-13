//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link, InputAdornment, Alert, CircularProgress } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../utils/api';

// Login component 
const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // Enhanced form validation rules
  const validationRules = {
    accountNumber: {
      required: 'Account number is required',
      pattern: {
        value: /^[0-9]{10,16}$/,
        message: 'Account number must be 10-16 digits only'
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
      }
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const sanitizedData = {
        accountNumber: data.accountNumber.trim().replace(/[^0-9]/g, ''),
        password: data.password
      };

      const result = await authAPI.login(sanitizedData);
      
      if (result.token) {
        localStorage.setItem('authToken', result.token);
      }
      if (result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('accountNumber', result.user.accountNumber);
      }

      setSuccess(result.message);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

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
          placeholder="Password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          fullWidth
          disabled={loading}
          error={!!errors.password}
          helperText={errors.password?.message}
          sx={{
            mb: 3,
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
              fontSize: '16px',
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
            autoComplete: 'current-password'
          }}
        />
        
        <Box sx={{ textAlign: 'right', mb: 5 }}>
          <Link 
            component={RouterLink}
            to="/forgot-password"
            sx={{ 
              color: 'white',
              textDecoration: 'none',
              fontSize: '18px',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Forgot password
          </Link>
        </Box>
        
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
              mb: 5,
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
              Logging in...
            </Box>
          ) : (
            'Login'
          )}
        </Button>
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
        }}
      >
        <Typography 
          sx={{ 
            color: 'black',
            fontSize: '20px',
          }}
        >
          Don't Have An Account ?{' '}
          <Link 
            component={RouterLink}
            to="/register"
            sx={{ 
              color: 'white',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '20px',
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            Register Now
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////