//----------------------------------------- start of file ---------------------------------//

//========================= start of imports =======================//
import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EmployeeLogin from './components/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CustomerManagement from './pages/CustomerManagement';
import PaymentVerification from './pages/PaymentVerification';

//============================== end of imports =============================//

// Define the theme with primary and secondary colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Main App component for the employee 
function App() {
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [currentView, setCurrentView] = useState('dashboard');
  // State to store employee data after login
  const [employee, setEmployee] = useState(null);

  // Handler for successful login
  const handleLogin = (employeeData) => {
    setIsAuthenticated(true);
    setEmployee(employeeData);
    setCurrentView('dashboard');
  };

  // Handler for logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmployee(null);
    setCurrentView('dashboard');
  };

  // Handler for navigation
  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  // Function to render the current view
  const renderCurrentView = () => {
    // If not authenticated, show login screenn
    if (!isAuthenticated) {
      return <EmployeeLogin onLogin={handleLogin} />;
    }

    // Switch based on current view
    switch (currentView) {
      case 'customers':
        return <CustomerManagement onNavigate={handleNavigation} onLogout={handleLogout} employee={employee} />;
      case 'payments':
        return <PaymentVerification onNavigate={handleNavigation} onLogout={handleLogout} employee={employee} />;
      default:
        return <EmployeeDashboard onNavigate={handleNavigation} onLogout={handleLogout} employee={employee} />;
    }
  };

  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        {renderCurrentView()}
      </div>
    </ThemeProvider>
  );
}

export default App;
//--------------------------------------- end of file -------------------------------------//