import React, { useEffect, useMemo, useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import AuthButton from '../components/AuthButton';
import { loadStripe } from '@stripe/stripe-js';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  pricePerCredit?: number;
  totalPrice: number;
  savings?: {
    percentage: number;
    amount: number;
  };
  popular?: boolean;
  custom?: boolean;
}

interface BillingInfo {
  type: 'azienda' | 'privato';
  // Azienda fields
  denominazioneSociale?: string;
  indirizzo?: string;
  partitaIva?: string;
  codiceUnivoco?: string;
  emailFatturazione?: string;
  // Privato fields
  nome?: string;
  cognome?: string;
  codiceFiscale?: string;
}

// Base list with only totals; pricePerCredit and savings are computed below
const creditPackages: CreditPackage[] = [
  {
    id: '10-credits',
    name: 'Pacchetto 10 crediti',
    credits: 10,
    totalPrice: 10.00,
  },
  {
    id: '50-credits',
    name: 'Pacchetto 50 crediti',
    credits: 50,
    totalPrice: 30.00,
  },
  {
    id: '100-credits',
    name: 'Pacchetto 100 crediti',
    credits: 100,
    totalPrice: 45.00,
    popular: true,
  },
  {
    id: '500-credits',
    name: 'Pacchetto 500 crediti',
    credits: 500,
    totalPrice: 175.00,
  },
  {
    id: '1000-credits',
    name: 'Pacchetto 1000 crediti',
    credits: 1000,
    totalPrice: 250.00,
  },
  {
    id: 'custom',
    name: 'Servizio Personalizzato',
    credits: 0,
    pricePerCredit: 0,
    totalPrice: 0,
    custom: true,
  },
];

const RicaricaCrediti: React.FC = () => {
  const account = useActiveAccount();
  const walletAddress = account?.address?.toLowerCase() || '';

  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({
    type: 'azienda'
  });
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  // Compute dynamic pricePerCredit and savings based on a base price of 1€/credito
  const computedPackages = useMemo(() => {
    const basePricePerCredit = 1; // riferimento: 10 crediti = 10€
    return creditPackages.map((p) => {
      if (p.custom || p.credits <= 0 || p.totalPrice <= 0) return p;
      const pricePerCredit = p.totalPrice / p.credits;
      const savingsAmount = Math.max(0, (basePricePerCredit * p.credits) - p.totalPrice);
      const percentage = (savingsAmount > 0 && (basePricePerCredit * p.credits) > 0)
        ? Math.round((savingsAmount / (basePricePerCredit * p.credits)) * 100)
        : 0;
      return {
        ...p,
        pricePerCredit,
        savings: savingsAmount > 0 ? { amount: Number(savingsAmount.toFixed(2)), percentage } : undefined,
      } as CreditPackage;
    });
  }, []);


  const storageKey = useMemo(() => walletAddress ? `billing_info_${walletAddress}` : '', [walletAddress]);

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as BillingInfo;
        setBillingInfo(saved);
        setIsEditingBilling(false);
      } else {
        setIsEditingBilling(true);
      }
    } catch {
      setIsEditingBilling(true);
    }
  }, [storageKey, showPaymentForm]);

  const handlePurchase = async (pkg: CreditPackage) => {
    if (pkg.custom) {
      window.location.href = '/contatti';
      return;
    }

    // Require login before proceeding
    if (!walletAddress) {
      setSelectedPackage(pkg);
      setShowAuthPrompt(true);
      return;
    }

    setSelectedPackage(pkg);
    setShowPaymentForm(true);
  };

  const handlePayment = async () => {
    if (!selectedPackage) return;
    if (!walletAddress) {
      setShowAuthPrompt(true);
      return;
    }

    // Validate billing
    setFormError(null);
    const v = validateBilling(billingInfo);
    setBillingErrors(v.errors);
    if (!v.valid) {
      setFormError('Controlla i dati di fatturazione evidenziati.');
      return;
    }

    setIsLoading(true);
    try {
      // Save billing info per wallet so we can prefill next time
      if (storageKey) {
        localStorage.setItem(storageKey, JSON.stringify(billingInfo));
      }
      const stripeKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
      if (!stripeKey) {
        throw new Error('Chiave pubblica Stripe non configurata');
      }

      const stripe = await loadStripe(stripeKey);
      if (!stripe) {
        throw new Error('Stripe non inizializzato');
      }

      const response = await fetch('/api/stripe?action=create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          credits: selectedPackage.credits,
          amount: selectedPackage.totalPrice,
          billingInfo,
          walletAddress,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setFormError(err?.error || 'Errore creazione sessione Stripe');
        return;
      }

      const { sessionId } = await response.json();
      if (!sessionId) {
        setFormError('Sessione di pagamento mancante. Riprova.');
        return;
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        setFormError(error.message || 'Errore redirect a Stripe');
      }
    } catch (error) {
      console.error('Local save error:', error);
      setFormError((error as any)?.message || 'Errore inatteso. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBillingInfoChange = (field: keyof BillingInfo, value: string) => {
    setBillingInfo(prev => ({
      ...prev,
      [field]: value
    }));
    setBillingErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Validators
  const isEmail = (v: string) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v.trim());
  const isDigits = (v: string, len: number) => new RegExp(`^\\d{${len}}$`).test(v.trim());
  const isAlnum = (v: string, len: number) => new RegExp(`^[A-Za-z0-9]{${len}}$`).test(v.trim());
  // Codice Fiscale validation (basic with checksum)
  const isValidCodiceFiscale = (cfRaw: string) => {
    const cf = cfRaw.toUpperCase().trim();
    if (!/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/.test(cf)) return false;
    const evenMap: Record<string, number> = {};
    for (let i = 0; i <= 9; i++) evenMap[i.toString()] = i;
    for (let i = 0; i < 26; i++) evenMap[String.fromCharCode(65 + i)] = i;
    const oddMap: Record<string, number> = {
      '0': 1,'1': 0,'2': 5,'3': 7,'4': 9,'5': 13,'6': 15,'7': 17,'8': 19,'9': 21,
      A: 1,B: 0,C: 5,D: 7,E: 9,F: 13,G: 15,H: 17,I: 19,J: 21,
      K: 2,L: 4,M: 18,N: 20,O: 11,P: 3,Q: 6,R: 8,S: 12,T: 14,
      U: 16,V: 10,W: 22,X: 25,Y: 24,Z: 23,
    } as any;
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      const c = cf[i];
      sum += (i % 2 === 0) ? oddMap[c] ?? 0 : evenMap[c] ?? 0; // positions 1-based odd
    }
    const check = String.fromCharCode(65 + (sum % 26));
    return check === cf[15];
  };

  const validateBilling = (b: BillingInfo) => {
    const errors: Record<string, string> = {};
    const requireField = (key: keyof BillingInfo, label: string) => {
      const v = (b[key] || '').toString().trim();
      if (!v) errors[key as string] = `${label} è obbligatorio`;
      return v;
    };
    const emailVal = requireField('emailFatturazione', 'Email');
    if (emailVal && !isEmail(emailVal)) errors.emailFatturazione = 'Email non valida';

    if (b.type === 'azienda') {
      const denom = requireField('denominazioneSociale', 'Denominazione Sociale');
      requireField('indirizzo', 'Indirizzo');
      const piva = requireField('partitaIva', 'Partita IVA');
      const sdiOrPec = requireField('codiceUnivoco', 'Codice Univoco SDI o PEC');
      if (piva && !isDigits(piva, 11)) errors.partitaIva = 'Partita IVA deve avere 11 cifre';
      if (sdiOrPec) {
        if (sdiOrPec.includes('@')) {
          if (!isEmail(sdiOrPec)) errors.codiceUnivoco = 'PEC non valida (email)';
        } else if (!isAlnum(sdiOrPec, 7)) {
          errors.codiceUnivoco = 'SDI deve avere 7 caratteri alfanumerici';
        }
      }
      if (denom && denom.length < 2) errors.denominazioneSociale = 'Denominazione troppo corta';
    } else {
      requireField('nome', 'Nome');
      requireField('cognome', 'Cognome');
      requireField('indirizzo', 'Indirizzo');
      const cf = requireField('codiceFiscale', 'Codice Fiscale');
      if (cf && !isValidCodiceFiscale(cf)) errors.codiceFiscale = 'Codice Fiscale non valido';
    }
    return { valid: Object.keys(errors).length === 0, errors };
  };

  // If user connects from the auth prompt, close it and open the payment modal
  useEffect(() => {
    if (walletAddress && showAuthPrompt && selectedPackage) {
      setShowAuthPrompt(false);
      setShowPaymentForm(true);
    }
  }, [walletAddress, showAuthPrompt, selectedPackage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Ricarica Crediti
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Scegli il pacchetto di crediti più adatto alle tue esigenze. 
            Più crediti acquisti, più risparmi!
          </p>
        </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
          {computedPackages.map((pkg) => (
            <div
              key={pkg.id}
                     className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col min-h-[520px] ${
                pkg.popular
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : pkg.custom
                  ? 'border-purple-300'
                  : 'border-slate-200'
              }`}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Più Popolare
                  </span>
                </div>
              )}

              {/* Custom Service Badge */}
              {pkg.custom && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Personalizzato
                  </span>
                </div>
              )}

                     <div className="p-8 flex flex-col h-full">
                {/* Package Name */}
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {pkg.name}
                </h3>

                {pkg.custom ? (
                  /* Custom Service Content */
                  <div className="flex flex-col flex-grow">
                    <div className="text-3xl font-bold text-purple-600 mb-4 text-left">
                      La soluzione perfetta, creata solo per te.
                    </div>
                    <div className="text-left space-y-4 text-slate-700 mb-6">
                      <div>
                        <h4 className="font-semibold text-slate-900">Servizio Custom</h4>
                        <p className="text-sm">Soluzioni personalizzate per le esigenze specifiche della tua azienda</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Assistente Dedicato</h4>
                        <p className="text-sm">Supporto tecnico prioritario e consulenza specializzata</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">Iscrizioni Bulk</h4>
                        <p className="text-sm">Gestione automatizzata di grandi volumi di documenti, anche tramite agente AI</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handlePurchase(pkg)}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mt-auto"
                    >
                      Contatta Ora
                    </button>
                  </div>
                ) : (
                  /* Regular Package Content */
                  <div className="flex flex-col flex-grow">
                    {/* Texts centered vertically */}
                    <div className="flex flex-col flex-grow justify-center">
                      {/* Credits */}
                      <div className="text-center mb-6 min-h-[72px] flex flex-col justify-end">
                        <div className="text-4xl font-bold text-slate-900 mb-2">
                          {pkg.credits.toLocaleString()}
                        </div>
                        <div className="text-slate-600">Crediti</div>
                      </div>

                      {/* Price */}
                      <div className="text-center mb-6 min-h-[64px] flex flex-col justify-start">
                        <div className="text-3xl font-bold text-slate-900 mb-1">
                          €{pkg.totalPrice.toFixed(2)}
                        </div>
                        <div className="text-slate-600">
                          €{pkg.pricePerCredit.toFixed(3)} per credito
                        </div>
                      </div>

                      {/* Savings */}
                      {pkg.savings && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                          <div className="flex items-center justify-center">
                            <span className="text-green-600 font-semibold">
                              Risparmio: {pkg.savings.percentage}% (€{pkg.savings.amount})
                            </span>
                          </div>
                        </div>
                      )}
                      {(!pkg.savings && pkg.id === '10-credits') && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 invisible">
                          <div className="flex items-center justify-center">
                            <span className="font-semibold">Placeholder</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Purchase Button - Always at bottom */}
                    <button
                      onClick={() => handlePurchase(pkg)}
                      disabled={isLoading}
                      className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mt-auto ${
                        pkg.popular
                          ? 'bg-blue-500 hover:bg-blue-600 text-white'
                          : 'bg-transparent border-2 border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5]/10'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? 'Elaborazione...' : 'Acquista Ora'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

              {/* Auth Prompt Modal */}
              {showAuthPrompt && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold text-slate-900">Non hai effettuato l'accesso</h3>
                      <p className="text-slate-600">Prima di poter acquistare un pacchetto, devi essere loggato.</p>
                      <div className="flex gap-3 pt-2">
                        <AuthButton label="Accedi" className="flex-1 justify-center" />
                        <button onClick={() => setShowAuthPrompt(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">Chiudi</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Modal */}
        {showPaymentForm && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Completa l'acquisto</h2>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                       {/* Package Summary */}
                <div className="bg-slate-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-slate-900 mb-2">{selectedPackage.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{selectedPackage.credits} crediti</span>
                    <span className="text-2xl font-bold text-slate-900">€{selectedPackage.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                       {/* Previous Info Summary (if exists and not editing) */}
                       {walletAddress && !isEditingBilling && (
                         <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                           <div className="flex items-center justify-between mb-2">
                             <h4 className="font-semibold text-slate-900">Dati salvati</h4>
                             <button onClick={() => setIsEditingBilling(true)} className="text-[#4f46e5] hover:underline text-sm">Modifica</button>
                           </div>
                           <div className="text-sm text-slate-700 space-y-1">
                             {billingInfo.type === 'azienda' ? (
                               <>
                                 <div><strong>Tipo:</strong> Azienda</div>
                                 <div><strong>Denominazione:</strong> {billingInfo.denominazioneSociale || '-'}</div>
                                 <div><strong>Indirizzo:</strong> {billingInfo.indirizzo || '-'}</div>
                                 <div><strong>P.IVA:</strong> {billingInfo.partitaIva || '-'}</div>
                                 <div><strong>SDI/PEC:</strong> {billingInfo.codiceUnivoco || '-'}</div>
                               </>
                             ) : (
                               <>
                                 <div><strong>Tipo:</strong> Privato</div>
                                 <div><strong>Nome:</strong> {billingInfo.nome || '-'}</div>
                                 <div><strong>Cognome:</strong> {billingInfo.cognome || '-'}</div>
                                 <div><strong>Indirizzo:</strong> {billingInfo.indirizzo || '-'}</div>
                                 <div><strong>Codice Fiscale:</strong> {billingInfo.codiceFiscale || '-'}</div>
                               </>
                             )}
                           </div>
                         </div>
                       )}

                {/* Billing Type Selection */}
                       <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Tipo di fatturazione</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="billingType"
                        value="azienda"
                        checked={billingInfo.type === 'azienda'}
                        onChange={(e) => handleBillingInfoChange('type', e.target.value as 'azienda' | 'privato')}
                        className="mr-2"
                      />
                      Azienda
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="billingType"
                        value="privato"
                        checked={billingInfo.type === 'privato'}
                        onChange={(e) => handleBillingInfoChange('type', e.target.value as 'azienda' | 'privato')}
                        className="mr-2"
                      />
                      Privato
                    </label>
                  </div>
                        {formError && (
                          <div className="mt-3 text-sm text-red-600">{formError}</div>
                        )}
                </div>

                {/* Billing Form */}
                       {isEditingBilling && (
                       <div className="space-y-4 mb-6">
                  {billingInfo.type === 'azienda' ? (
                    <>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                  type="email"
                                  value={billingInfo.emailFatturazione || ''}
                                  onChange={(e) => handleBillingInfoChange('emailFatturazione', e.target.value)}
                                  className={`w-full px-3 py-2 border ${billingErrors.emailFatturazione ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                  required
                                />
                                {billingErrors.emailFatturazione && (
                                  <p className="text-red-600 text-xs mt-1">{billingErrors.emailFatturazione}</p>
                                )}
                              </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Denominazione Sociale *</label>
                        <input
                          type="text"
                          value={billingInfo.denominazioneSociale || ''}
                                  onChange={(e) => handleBillingInfoChange('denominazioneSociale', e.target.value)}
                                  className={`w-full px-3 py-2 border ${billingErrors.denominazioneSociale ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          required
                        />
                                {billingErrors.denominazioneSociale && (
                                  <p className="text-red-600 text-xs mt-1">{billingErrors.denominazioneSociale}</p>
                                )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Indirizzo *</label>
                        <input
                          type="text"
                          value={billingInfo.indirizzo || ''}
                                  onChange={(e) => handleBillingInfoChange('indirizzo', e.target.value)}
                                  className={`w-full px-3 py-2 border ${billingErrors.indirizzo ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          required
                        />
                                {billingErrors.indirizzo && (
                                  <p className="text-red-600 text-xs mt-1">{billingErrors.indirizzo}</p>
                                )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Partita IVA *</label>
                        <input
                          type="text"
                          value={billingInfo.partitaIva || ''}
                                  onChange={(e) => handleBillingInfoChange('partitaIva', e.target.value)}
                                  className={`w-full px-3 py-2 border ${billingErrors.partitaIva ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          required
                        />
                                {billingErrors.partitaIva && (
                                  <p className="text-red-600 text-xs mt-1">{billingErrors.partitaIva}</p>
                                )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Codice Univoco (SDI) o PEC *</label>
                        <input
                          type="text"
                          value={billingInfo.codiceUnivoco || ''}
                                  onChange={(e) => handleBillingInfoChange('codiceUnivoco', e.target.value)}
                                  className={`w-full px-3 py-2 border ${billingErrors.codiceUnivoco ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          required
                        />
                                {billingErrors.codiceUnivoco && (
                                  <p className="text-red-600 text-xs mt-1">{billingErrors.codiceUnivoco}</p>
                                )}
                      </div>
                    </>
                  ) : (
                    <>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                                <input
                                  type="email"
                                  value={billingInfo.emailFatturazione || ''}
                                  onChange={(e) => handleBillingInfoChange('emailFatturazione', e.target.value)}
                                  className={`w-full px-3 py-2 border ${billingErrors.emailFatturazione ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                                  required
                                />
                                {billingErrors.emailFatturazione && (
                                  <p className="text-red-600 text-xs mt-1">{billingErrors.emailFatturazione}</p>
                                )}
                              </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Nome *</label>
                          <input
                            type="text"
                            value={billingInfo.nome || ''}
                                    onChange={(e) => handleBillingInfoChange('nome', e.target.value)}
                                    className={`w-full px-3 py-2 border ${billingErrors.nome ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            required
                          />
                                  {billingErrors.nome && (
                                    <p className="text-red-600 text-xs mt-1">{billingErrors.nome}</p>
                                  )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Cognome *</label>
                          <input
                            type="text"
                            value={billingInfo.cognome || ''}
                                    onChange={(e) => handleBillingInfoChange('cognome', e.target.value)}
                                    className={`w-full px-3 py-2 border ${billingErrors.cognome ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            required
                          />
                                  {billingErrors.cognome && (
                                    <p className="text-red-600 text-xs mt-1">{billingErrors.cognome}</p>
                                  )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Indirizzo *</label>
                        <input
                          type="text"
                          value={billingInfo.indirizzo || ''}
                                  onChange={(e) => handleBillingInfoChange('indirizzo', e.target.value)}
                                  className={`w-full px-3 py-2 border ${billingErrors.indirizzo ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          required
                        />
                                {billingErrors.indirizzo && (
                                  <p className="text-red-600 text-xs mt-1">{billingErrors.indirizzo}</p>
                                )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Codice Fiscale *</label>
                        <input
                          type="text"
                          value={billingInfo.codiceFiscale || ''}
                                  onChange={(e) => handleBillingInfoChange('codiceFiscale', e.target.value)}
                                  className={`w-full px-3 py-2 border ${billingErrors.codiceFiscale ? 'border-red-500' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          required
                        />
                                {billingErrors.codiceFiscale && (
                                  <p className="text-red-600 text-xs mt-1">{billingErrors.codiceFiscale}</p>
                                )}
                      </div>
                    </>
                  )}
                       </div>
                       )}

                {/* Payment Button */}
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handlePayment}
                    disabled={isLoading}
                           className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Elaborazione...' : 'Procedi al Pagamento'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Come funzionano i crediti?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Acquista</h4>
                  <p className="text-slate-600 text-sm">Scegli il pacchetto che preferisci e completa l'acquisto</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                         <h4 className="font-semibold text-slate-900">Crediti Aggiunti</h4>
                  <p className="text-slate-600 text-sm">I crediti vengono aggiunti istantaneamente al tuo account</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-100 rounded-full p-2">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Utilizza</h4>
                         <p className="text-slate-600 text-sm">Usa i crediti per certificare i tuoi documenti</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RicaricaCrediti;

