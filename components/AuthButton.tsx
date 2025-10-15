import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthButton: React.FC<{ label?: string; includeMetamask?: boolean; className?: string; disableAA?: boolean }> = ({ label = "Accedi", includeMetamask = false, className = "", disableAA = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login');
  };

  return (
    <button
      onClick={handleClick}
      className={className || `inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary text-white font-medium hover:bg-primary-700 transition-colors`}
    >
      {label}
    </button>
  );
};

export default AuthButton;

