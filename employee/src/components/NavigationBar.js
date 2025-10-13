//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
/**
 * NAVIGATION BAR COMPONENT
 * Top navigation bar for the employee portal
 * Provides navigation between different sections and user account menu
 */
//////////////////////////////////////////////////////////////////coming in part 3//////////////////////////////////////////////////////////////////

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
} from '@mui/material';
import { AccountCircle, Dashboard, People, Payment, ExitToApp } from '@mui/icons-material';

/**
 * NavigationBar Component
 * @param {Object} employee - Currently logged in employee data (name, role, etc.)
 * @param {Function} onNavigate - Callback function to navigate between pages
 * @param {Function} onLogout - Callback function to log out the employee
 * @param {String} currentPage - Current active page identifier for highlighting
 */
const NavigationBar = ({ employee, onNavigate, onLogout, currentPage }) => {
  // State for account menu dropdown
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Open account menu dropdown
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Close account menu dropdown
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Handle logout action
  const handleLogout = () => {
    handleClose();
    onLogout();
  };

  // Navigation menu items configuration
  const navItems = [
    { label: 'Dashboard', value: 'dashboard', icon: <Dashboard /> },
    { label: 'Customers', value: 'customers', icon: <People /> },
    { label: 'Payments', value: 'payments', icon: <Payment /> },
  ];

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Application Title */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          BankBridge Employee Portal
        </Typography>
        
        {/* Navigation Buttons */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.value}
              color="inherit"
              startIcon={item.icon}
              onClick={() => onNavigate(item.value)}
              sx={{
                // Highlight active page with subtle background
                backgroundColor: currentPage === item.value ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Employee Info and Account Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Display employee name and role */}
          <Typography variant="body1">
            {employee?.name} ({employee?.role})
          </Typography>
          
          {/* Account menu icon button */}
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          
          {/* Account dropdown menu */}
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {/* Logout menu item */}
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////