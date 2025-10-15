import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegistrationForm from '../components/RegistrationForm';
import { Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, company, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && company) {
      if (company.isActive) {
        navigate('/dashboard');
      } else {
        navigate('/form');
      }
    }
  }, [user, company, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {isLogin ? (
          <LoginForm onSuccess={() => {
            // Navigation will be handled by useEffect
          }} />
        ) : (
          <RegistrationForm onSuccess={() => {
            // Navigation will be handled by useEffect
          }} />
        )}
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? (
              <>
                Non hai un account?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Registrati qui
                </button>
              </>
            ) : (
              <>
                Hai già un account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Accedi qui
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;