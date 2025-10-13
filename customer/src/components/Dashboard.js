//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  Button
} from '@mui/material';
import { AttachMoney, SwapHoriz, Home, Receipt } from '@mui/icons-material';

const Dashboard = () => {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  // Close logout dropdown when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (showLogout && !event.target.closest('.logout-dropdown')) {
  //       setShowLogout(false);
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //   };
  // }, [showLogout]);

  const handleLogoClick = (event) => {
    setShowLogout(!showLogout);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };


  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #ff9800 0%, #2196f3 100%)',
        position: 'relative',
      }}
    >
      {/* Navigation Bar */}
      <Box
        className="nav-container"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '15px 80px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderBottom: '1px solid #e0e0e0',
          position: 'relative',
          zIndex: 1000,
        }}
      >
        {/* Navigation Items */}
        <Box
          sx={{
            display: 'flex',
            gap: 40,
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <IconButton
              sx={{ backgroundColor: '#f5f5f5', padding: '15px' }}
              onClick={() => navigate('/local-transactions')}
              title="Local Transfer"
            >
              <Receipt sx={{ fontSize: 35 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
              Local Transfer
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, ml: 30 }}>
            <IconButton sx={{ backgroundColor: '#f5f5f5', padding: '15px' }} onClick={() => navigate('/transaction-transfer-continued')}>
              <SwapHoriz sx={{ fontSize: 35 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
              International Transfer
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <IconButton sx={{ backgroundColor: '#f5f5f5', padding: '15px' }}>
              <Home sx={{ fontSize: 35 }} />
            </IconButton>
            <Typography variant="caption" sx={{ fontSize: '12px', fontWeight: 'bold', color: '#333' }}>
              Home
            </Typography>
        </Box>

        {/* Logout Dropdown */}
        {showLogout && (
          <Box
            className="logout-dropdown"
            sx={{
              position: 'absolute',
              top: '100%',
              right: 80,
              width: 180,
              backgroundColor: '#424242',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              border: '1px solid #333',
              zIndex: 1001,
              overflow: 'hidden',
            }}
          >
            <Button
              onClick={handleLogout}
              fullWidth
              sx={{
                py: 1.5,
                px: 2,
                color: 'white',
                fontWeight: '500',
                textTransform: 'none',
                fontSize: '14px',
                justifyContent: 'flex-start',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: '#616161',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Box>

        {/* Logo */}
        <Box
          className="logo-container"
          onClick={handleLogoClick}
          sx={{
            width: 70,
            height: 70,
            borderRadius: '50%',
            backgroundColor: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #ddd',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out',
            position: 'relative',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          }}
        >
          <img
            src="/bank bridge logo.png"
            alt="BankBridge"
            style={{
              width: '45px',
              height: 'auto',
              pointerEvents: 'none'
            }}
          />
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          gap: 6,
          minHeight: 'calc(100vh - 120px)',
        }}
      >

        {/* Account Card */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Card
            sx={{
              width: 450,
              height: 280,
              background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
              color: 'white',
              borderRadius: 3,
              position: 'relative',
              overflow: 'visible',
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            }}
          >
            <CardContent sx={{ padding: '30px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <Box>
                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                   <Box
                     sx={{
                       width: 60,
                       height: 60,
                       borderRadius: '50%',
                       backgroundColor: 'white',
                       display: 'flex',
                       justifyContent: 'center',
                       alignItems: 'center',
                     }}
                   >
                     <img
                       src="/bank bridge logo.png"
                       alt="BankBridge"
                       style={{ width: '35px', height: 'auto' }}
                     />
                   </Box>
                 </Box>

                 <Box sx={{ mb: 2 }}>
                   <Typography variant="h4" sx={{ fontWeight: 'bold', letterSpacing: 2, lineHeight: 1.3 }}>
                     555 **** **** ****
                   </Typography>
                 </Box>
              </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Box>
                  </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8, fontSize: 12 }}>
                    Expiry
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', fontSize: 16 }}>
                    04/12
                  </Typography>
                </Box>
              </Box>

              {/* Mastercard logo placeholder */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 30,
                  right: 40,
                  width: 50,
                  height: 30,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: 12, color: '#333' }}>
                  MC
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Account Details Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Card
            sx={{
              width: 550,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            }}
          >
            <CardContent sx={{ padding: '30px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 70,
                    height: 70,
                    backgroundColor: '#6c5ce7',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 28,
                    fontWeight: 'bold',
                  }}
                >
                  D
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    Transaction
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#666' }}>
                    555 245 5514
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto', textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                    MyMainAccount
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Box>
                  <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                    Available balance
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                    R 5 466.50
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ color: '#666', mb: 1 }}>
                    Latest balance
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                    R 5 265.50
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Account Table */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <TableContainer
            component={Paper}
            sx={{
              width: 550,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: 3,
              boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: 16, padding: '15px' }}>All Accounts</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: 16, padding: '15px' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: 16, padding: '15px' }}>Currency</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: 16, padding: '15px' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontSize: 16, padding: '15px' }}>Cheq</TableCell>
                  <TableCell sx={{ fontSize: 16, padding: '15px' }}>Active</TableCell>
                  <TableCell sx={{ fontSize: 16, padding: '15px' }}>ZAR</TableCell>
                  <TableCell sx={{ fontSize: 16, fontWeight: 'bold', padding: '15px' }}>R45000-00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontSize: 16, padding: '15px' }}>Savings</TableCell>
                  <TableCell sx={{ fontSize: 16, padding: '15px' }}>Active</TableCell>
                  <TableCell sx={{ fontSize: 16, padding: '15px' }}>ZAR</TableCell>
                  <TableCell sx={{ fontSize: 16, fontWeight: 'bold', padding: '15px' }}>ZAR</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////