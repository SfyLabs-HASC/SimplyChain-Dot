import React, { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import RegistrationForm from '../components/RegistrationForm';
// Header and Footer are already rendered globally in App.tsx

const Form: React.FC = () => {
  const account = useActiveAccount();
  const [hasRequestSent, setHasRequestSent] = useState(false);
  const [isCheckingRequest, setIsCheckingRequest] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (account?.address) {
      checkIfRequestAlreadySent();
    }
  }, [account]);

  const checkIfRequestAlreadySent = async () => {
    if (!account?.address) return;

    setIsCheckingRequest(true);
    try {
      const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
      if (response.ok) {
        const data = await response.json();
        const pending = !!data?.pending;
        const active = !!data?.isActive;
        setIsActive(active);
        setHasRequestSent(!active && pending);
      } else {
        setHasRequestSent(false);
        setIsActive(false);
      }
    } catch (error) {
      console.error('Errore durante il controllo della richiesta:', error);
      setHasRequestSent(false);
      setIsActive(false);
    } finally {
      setIsCheckingRequest(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 antialiased">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="w-full">
          {!hasRequestSent && !isActive && (
            <div className="text-center mb-8 md:mb-12">
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Benvenuto su <span className="text-primary">SimplyChain</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Il tuo account non è ancora attivo. Compila il form di registrazione per inviare una richiesta di attivazione.
              </p>
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            {!account ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-slate-200">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    Accedi e registrati
                  </h2>
                  <p className="text-lg text-slate-600 mb-8">
                    Per procedere con la registrazione, devi prima connetterti utilizzando il pulsante in alto a destra.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-8 py-3 border-2 border-slate-300 text-base font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Torna alla Home
                  </Link>
                </div>
              </div>
            ) : isCheckingRequest ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-slate-200">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader2 className="h-8 w-8 text-slate-500 animate-spin" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                    Controllo stato richiesta...
                  </h2>
                  <p className="text-lg text-slate-600">
                    Stiamo verificando se hai già inviato una richiesta.
                  </p>
                </div>
              </div>
            ) : isActive ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-slate-200">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                    Hai già attivato il tuo account!
                  </h2>
                  <p className="text-lg text-slate-700 mb-8">
                    Il tuo account è attivo. Puoi tornare alla Home o procedere dalla Dashboard.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-primary hover:bg-primary-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Torna alla Home
                  </Link>
                </div>
              </div>
            ) : hasRequestSent ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center border border-slate-200">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                    RICHIESTA INVIATA
                  </h2>
                  <p className="text-lg text-slate-700 mb-8">
                    Hai già inviato una richiesta di attivazione. Verrai ricontattato dopo l'approvazione del tuo account.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-primary hover:bg-primary-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Torna alla Home
                  </Link>
                </div>
              </div>
            ) : (
              <RegistrationForm walletAddress={account.address} onSubmitted={() => setHasRequestSent(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;