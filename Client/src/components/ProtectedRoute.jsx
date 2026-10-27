import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');

  // Retrieve role from localStorage or fallback to parsed user object
  let rawRole = localStorage.getItem('role');
  if (!rawRole) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      rawRole = user?.role;
    } catch {
      rawRole = null;
    }
  }

  const userRole = String(rawRole || '').toLowerCase().trim();
  const targetRole = requiredRole ? String(requiredRole).toLowerCase().trim() : null;

  // Determine authorization
  const isAuthenticated = Boolean(token);
  const isAuthorized = isAuthenticated && (!targetRole || userRole === targetRole);

  const hasNotified = useRef(false);

  useEffect(() => {
    if (!isAuthorized && !hasNotified.current) {
      hasNotified.current = true;
      const message = !isAuthenticated
        ? 'Please login to access this page.'
        : 'Not Authorized. Admin access required.';

      toast.error(message, {
        toastId: 'auth-error-toast', // Prevents double toasts in React StrictMode
      });
    }
  }, [isAuthorized, isAuthenticated]);

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
