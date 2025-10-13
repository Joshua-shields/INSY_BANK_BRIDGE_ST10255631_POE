//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
/**
 * application router for the customer portal views
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//authentication components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ForgotUsername from './components/ForgotUsername';
import ProtectedRoute from './components/ProtectedRoute';
//transaction views
import TransactionTransferContinuedC5 from './pages/Transaction_transfer_continuued_C5';
import LocalTransactions from './pages/LocalTransactions';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes which are accessible without authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-username" element={<ForgotUsername />} />
        
        {/* Protected routes which require authentication to access */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/transaction-transfer-continued" element={<ProtectedRoute><TransactionTransferContinuedC5 /></ProtectedRoute>} />
        <Route path="/local-transactions" element={<ProtectedRoute><LocalTransactions /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////