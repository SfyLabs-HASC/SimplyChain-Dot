import React, { useState, useEffect } from "react";
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import RegistrationForm from '../components/RegistrationForm';

const Form: React.FC = () => {
  const { user, company, loading } = useAuth();
  const navigate = useNavigate();
  const [hasRequestSent, setHasRequestSent] = useState(false);
  const [isCheckingRequest, setIsCheckingRequest] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
        return;
      }
      
      if (company) {
        setIsActive(company.isActive);
        setHasRequestSent(company.pending && !company.isActive);
      }
    }
  }, [user, company, loading, navigate]);

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

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 antialiased">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="w-full">
          {!hasRequestSent && !isActive && (
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Registra la tua azienda
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Compila il form per richiedere l'accesso alla piattaforma SimplyChain
              </p>
            </div>
          )}

          {hasRequestSent && !isActive && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 mb-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Richiesta in elaborazione
                </h2>
                <p className="text-gray-600 mb-6">
                  La tua richiesta di registrazione è stata inviata e sarà esaminata dall'amministratore.
                  Riceverai una notifica via email quando il tuo account sarà attivato.
                </p>
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Stato richiesta</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Richiesta inviata</span>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">In attesa di approvazione</span>
                      <div className="w-5 h-5 border-2 border-yellow-500 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Account attivato</span>
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Torna alla home
              </button>
            </div>
          )}

          {isActive && (
            <div className="max-w-2xl mx-auto text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Account attivato!
                </h2>
                <p className="text-gray-600 mb-6">
                  Il tuo account è stato attivato con successo. Puoi ora accedere alla dashboard.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Vai alla Dashboard
                </button>
              </div>
            </div>
          )}

          {!hasRequestSent && !isActive && (
            <div className="max-w-2xl mx-auto">
              <RegistrationForm onSuccess={() => {
                setHasRequestSent(true);
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;