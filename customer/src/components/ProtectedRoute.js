//////////////////////////////////////////////////////////////////START OF FILE//////////////////////////////////////////////////////////////////
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const validateToken = () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setIsAuthenticated(false);
        setIsValidating(false);
        return;
      }

      // Basic JWT format validation
      try {
        const parts = token.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid token format');
        }

        // Decode payload to check expiry
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Date.now() / 1000;

        if (payload.exp && payload.exp < currentTime) {
          // Token expired, clear it
          localStorage.removeItem('authToken');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
        setIsValidating(false);
        } catch (error) {
            setIsAuthenticated(false);
            setIsValidating(false);
        }
    };

    validateToken();
  }, []);

  if (isValidating) {
    // Show loading while validating token
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #ff9800 0%, #2196f3 100%)'
      }}>
        <div>Validating...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
//////////////////////////////////////////////////////////////////END OF FILE//////////////////////////////////////////////////////////////////