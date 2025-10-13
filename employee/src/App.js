//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import EmployeeLogin from './components/EmployeeLogin';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CustomerManagement from './pages/CustomerManagement';
import PaymentVerification from './pages/PaymentVerification';

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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [employee, setEmployee] = useState(null);

  const handleLogin = (employeeData) => {
    setIsAuthenticated(true);
    setEmployee(employeeData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setEmployee(null);
    setCurrentView('dashboard');
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    if (!isAuthenticated) {
      return <EmployeeLogin onLogin={handleLogin} />;
    }

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
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////