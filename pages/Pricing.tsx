import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Pricing: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the new Piani page
    navigate('/piani', { replace: true });
  }, [navigate]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900">Reindirizzamento...</h1>
      <p className="mt-4 text-slate-600">Ti stiamo portando alla pagina dei piani.</p>
    </div>
  );
};

export default Pricing;

