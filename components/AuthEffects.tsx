import React, { useEffect, useRef } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthEffects: React.FC = () => {
  const { user, company, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prevUserRef = useRef<any>(null);

  useEffect(() => {
    if (loading) return;

    const prev = prevUserRef.current;
    const curr = user;
    
    console.log('AuthEffects - prev:', prev, 'curr:', curr, 'company:', company, 'location:', location.pathname);
    
    // Detect logout: went from defined to undefined
    if (prev && !curr) {
      console.log('Logout detected, redirecting to home');
      if (location.pathname !== '/') {
        navigate('/', { replace: false });
      }
    }
    
    // Detect login: Handle redirect based on company status and current page
    if (!prev && curr && company !== undefined) {
      console.log('Login detected, checking company status...', 'company:', company, 'current page:', location.pathname);
      
      if (!company || (!company.isActive && !company.pending)) {
        // No company or not registered: redirect to form
        console.log('No company or not registered, redirecting to form');
        navigate('/form', { replace: false });
      } else if (company.pending && !company.isActive) {
        // Pending approval: redirect to form to show pending status
        console.log('Company pending approval, redirecting to form');
        navigate('/form', { replace: false });
      } else if (company.isActive) {
        // Active: check current page
        if (location.pathname === '/') {
          // From homepage: go to dashboard
          console.log('From homepage, redirecting to dashboard');
          navigate('/dashboard', { replace: false });
        } else if (location.pathname === '/dashboard') {
          // Already on dashboard: stay here
          console.log('Already on dashboard, staying here');
          // No redirect needed
        } else {
          // Any other page: stay on current page
          console.log('On other page, staying on current page:', location.pathname);
          // No redirect needed
        }
      }
    }
    
    // Check if already logged in and on dashboard - verify if still active
    if (prev && curr && location.pathname === '/dashboard' && company !== undefined) {
      console.log('Already logged in on dashboard, checking if still active...', 'company:', company);
      if (!company.isActive) {
        console.log('No longer active, redirecting to form');
        navigate('/form', { replace: false });
      }
    }
    
    prevUserRef.current = curr;
  }, [user, company, loading, navigate, location.pathname]);

  return null;
};

export default AuthEffects;