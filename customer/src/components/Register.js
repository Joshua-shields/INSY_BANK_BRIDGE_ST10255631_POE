//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, InputAdornment, Link, Alert, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { authAPI } from '../utils/api';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();

  // Watch password field for confirmation validation
  const watchPassword = watch('password', '');

  // user need to follow these rules or else they cannot register 
  // we are using regex patterns 
  const validationRules = {
    name: {
      required: 'Full name is required',
      pattern: {
        value: /^[a-zA-Z\s'-]{2,50}$/,
        message: 'Name can only contain letters, spaces, hyphens, and apostrophes (2-50 characters)'
      }
    },
    idNumber: {
      required: 'ID number is required',
      pattern: {
        value: /^[0-9]{13}$/,
        message: 'ID number must be exactly 13 digits'
      }
    },
    accountNumber: {
      required: 'Account number is required',
      pattern: {
        value: /^[0-9]{10,16}$/,
        message: 'Account number must be 10-16 digits only'
      }
    },
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        message: 'Please enter a valid email address'
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
      },
      validate: {
        noWeakPatterns: (value) => {
          const weakPatterns = [/123456/, /password/i, /qwerty/i, /admin/i, /letmein/i, /welcome/i, /banking/i];
          if (weakPatterns.some(pattern => pattern.test(value))) {
            return 'Password contains common weak patterns';
          }
          return true;
        }
      }
    },
    confirmPassword: {
      required: 'Please confirm your password',
      validate: value => value === watchPassword || 'Passwords do not match'
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Frontend input sanitization
      // How this works what we do is reduce whitespace and get rid of non-numeric chars from id and account numbers
      const sanitizedData = {
        name: data.name.trim(),
        idNumber: data.idNumber.trim().replace(/[^0-9]/g, ''),
        accountNumber: data.accountNumber.trim().replace(/[^0-9]/g, ''),
        password: data.password,
        confirmPassword: data.confirmPassword,
        email: data.email.trim().toLowerCase()
      };

      const result = await authAPI.register(sanitizedData);
      setSuccess(result.message);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed. Please try again.');
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
          placeholder="Full Name"
          variant="outlined"
          fullWidth
          disabled={loading}
          error={!!errors.name}
          helperText={errors.name?.message}
          sx={{
            mb: 4,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 4,
              border: 'none',
              '& fieldset': {
                border: errors.name ? '2px solid #f44336' : 'none',
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
          {...register('name', validationRules.name)}
          inputProps={{
            maxLength: 50,
            autoComplete: 'name'
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
          placeholder="Password (min 12 chars with uppercase, lowercase, number, special char)"
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
          placeholder="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          variant="outlined"
          fullWidth
          disabled={loading}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          sx={{
            mb: 4,
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

        <TextField
          placeholder="Account Number (10-16 digits)"
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
            inputMode: 'numeric'
          }}
        />

        <TextField
          placeholder="Email Address"
          variant="outlined"
          fullWidth
          disabled={loading}
          error={!!errors.email}
          helperText={errors.email?.message}
          sx={{
            mb: 4,
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
              Registering...
            </Box>
          ) : (
            'Register'
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

export default Register;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////