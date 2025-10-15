import React, { useState, useEffect } from 'react';
import { useCookieConsent, CookiePreferences } from '../hooks/useCookieConsent';

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [tempPreferences, setTempPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
  });

  const { preferences, hasConsent, acceptAll, acceptNecessary, savePreferences } = useCookieConsent();

  useEffect(() => {
    // Show banner if user hasn't made a choice yet
    console.log('CookieBanner - hasConsent:', hasConsent);
    if (!hasConsent) {
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [hasConsent]);

  const handleAcceptAll = () => {
    console.log('Accepting all cookies');
    acceptAll();
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleAcceptNecessary = () => {
    console.log('Accepting only necessary cookies');
    acceptNecessary();
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleSaveCustomPreferences = () => {
    console.log('Saving custom preferences:', tempPreferences);
    savePreferences(tempPreferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setTempPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowBanner(false)}></div>
      
      {/* Banner */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {!showPreferences ? (
          // Main banner
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Gestione dei Cookie</h2>
                <p className="text-slate-600 mb-4">
                  Utilizziamo i cookie per migliorare la tua esperienza di navigazione, fornire funzionalità personalizzate e analizzare il nostro traffico. 
                  Alcuni cookie sono necessari per il funzionamento del sito, mentre altri ci aiutano a capire come utilizzi la nostra piattaforma.
                </p>
                <p className="text-sm text-slate-500">
                  Per maggiori informazioni, consulta la nostra <a href="/cookie" className="text-primary hover:underline">Cookie Policy</a> e la <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Personalizza
              </button>
              <button
                onClick={handleAcceptNecessary}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Solo Necessari
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Accetta Tutti
              </button>
            </div>
          </div>
        ) : (
          // Preferences panel
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Preferenze Cookie</h2>
              <button
                onClick={() => setShowPreferences(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6 mb-8">
              {/* Necessary Cookies */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">Cookie Necessari</h3>
                  <div className="flex items-center">
                    <div className="w-12 h-6 bg-primary rounded-full p-1">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                    </div>
                    <span className="ml-2 text-sm text-slate-500">Sempre attivi</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  Questi cookie sono essenziali per il funzionamento del sito web e non possono essere disabilitati. 
                  Includono cookie di sessione, sicurezza e funzionalità di base.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">Cookie Analitici</h3>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      tempPreferences.analytics ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      tempPreferences.analytics ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
                <p className="text-sm text-slate-600">
                  Questi cookie ci aiutano a capire come i visitatori interagiscono con il sito web raccogliendo 
                  informazioni in forma anonima. Ci permettono di migliorare le prestazioni e l'esperienza utente.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">Cookie di Marketing</h3>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      tempPreferences.marketing ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      tempPreferences.marketing ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </button>
                </div>
                <p className="text-sm text-slate-600">
                  Questi cookie vengono utilizzati per mostrare annunci pertinenti e coinvolgenti per te e i tuoi interessi. 
                  Possono anche essere utilizzati per limitare il numero di volte che vedi un annuncio.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={handleSaveCustomPreferences}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Salva Preferenze
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;