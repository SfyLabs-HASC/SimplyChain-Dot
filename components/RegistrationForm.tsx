import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Mail, User, Building, Globe, Linkedin, Facebook, Instagram, Twitter, Music } from 'lucide-react';

interface RegistrationFormProps {
  walletAddress: string;
  onSubmitted?: () => void;
}

const sectors = [
  "Agricoltura", "Alimentare e Bevande", "Manifatturiero", "Servizi", "Tecnologia",
  "Commercio al Dettaglio", "Sanità", "Finanza", "Costruzioni", "Trasporti e Logistica",
  "Turismo e Ospitalità", "Educazione", "Media e Intrattenimento", "Energia", "Immobiliare",
  "Moda", "Automotive", "Farmaceutico", "Consulenza", "No-Profit"
];

const InputField = ({ 
  field, 
  label, 
  type = 'text', 
  placeholder, 
  icon: Icon, 
  required = false,
  suggestion = '',
  value,
  error,
  onChange
}: {
  field: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: React.ComponentType<any>;
  required?: boolean;
  suggestion?: string;
  value: string;
  error?: string;
  onChange: (field: string, value: string) => void;
}) => (
  <div className="mb-6">
    <label htmlFor={field} className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none select-none">
        <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </div>
      <input
        type={type}
        id={field}
        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
          error 
            ? 'border-red-300 bg-red-50' 
            : 'border-slate-300 bg-white hover:border-slate-400 focus:border-primary'
        }`}
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(field, e.target.value)}
        autoComplete="on"
      />
      {error && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none select-none">
          <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
        </div>
      )}
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
    {suggestion && !error && (
      <p className="mt-1 text-sm text-slate-500">{suggestion}</p>
    )}
  </div>
);

const SelectField = ({ 
  field, 
  label, 
  options, 
  required = false,
  suggestion = '',
  value,
  error,
  onChange
}: {
  field: string;
  label: string;
  options: string[];
  required?: boolean;
  suggestion?: string;
  value: string;
  error?: string;
  onChange: (field: string, value: string) => void;
}) => (
  <div className="mb-6">
    <label htmlFor={field} className="block text-sm font-semibold text-slate-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Building className="h-5 w-5 text-slate-400" />
      </div>
      <select
        id={field}
        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white ${
          error 
            ? 'border-red-300 bg-red-50' 
            : 'border-slate-300 hover:border-slate-400 focus:border-primary'
        }`}
        value={value || ''}
        onChange={(e) => onChange(field, e.target.value)}
      >
        <option value="">Seleziona un settore</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
        <option value="Altro">Altro</option>
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
    {suggestion && !error && (
      <p className="mt-1 text-sm text-slate-500">{suggestion}</p>
    )}
  </div>
);

const RegistrationForm: React.FC<RegistrationFormProps> = ({ walletAddress, onSubmitted }) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    settore: '',
    settoreAltro: '',
    sitoWeb: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    twitter: '',
    tiktok: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url: string) => {
    if (!url) return true; // Optional field
    const urlRegex = /^https?:\/\/.+/;
    return urlRegex.test(url);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Il nome è obbligatorio';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Il nome deve essere di almeno 2 caratteri';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email è obbligatoria';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Inserisci un indirizzo email valido';
    }

    if (!formData.settore) {
      newErrors.settore = 'Il settore è obbligatorio';
    } else if (formData.settore === 'Altro' && !formData.settoreAltro.trim()) {
      newErrors.settoreAltro = 'Specifica il settore quando selezioni "Altro"';
    }

    // Validate URLs
    if (formData.sitoWeb && !validateUrl(formData.sitoWeb)) {
      newErrors.sitoWeb = 'Inserisci un URL valido (inizia con http:// o https://)';
    }
    if (formData.linkedin && !validateUrl(formData.linkedin)) {
      newErrors.linkedin = 'Inserisci un URL valido (inizia con http:// o https://)';
    }
    if (formData.facebook && !validateUrl(formData.facebook)) {
      newErrors.facebook = 'Inserisci un URL valido (inizia con http:// o https://)';
    }
    if (formData.instagram && !validateUrl(formData.instagram)) {
      newErrors.instagram = 'Inserisci un URL valido (inizia con http:// o https://)';
    }
    if (formData.twitter && !validateUrl(formData.twitter)) {
      newErrors.twitter = 'Inserisci un URL valido (inizia con http:// o https://)';
    }
    if (formData.tiktok && !validateUrl(formData.tiktok)) {
      newErrors.tiktok = 'Inserisci un URL valido (inizia con http:// o https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage('Per favore, correggi gli errori nel form.');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/register-company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          ...formData
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Richiesta di registrazione inviata con successo! Verrai ricontattato a breve.');
        setIsSuccess(true);
        // Inform parent to switch to submitted state and prevent resubmission
        if (typeof onSubmitted === 'function') {
          onSubmitted();
        }
      } else {
        setMessage(data.error || 'Errore durante l\'invio della richiesta.');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Errore:', error);
      setMessage('Si è verificato un errore di rete. Riprova più tardi.');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Modulo di Registrazione
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Compila tutti i campi obbligatori per inviare la tua richiesta di attivazione
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required Fields Section */}
          <div className="border-b border-slate-200 pb-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
              <CheckCircle className="h-6 w-6 text-primary mr-2" />
              Informazioni Obbligatorie
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                field="nome"
                label="Nome Azienda"
                placeholder="Inserisci il nome della tua azienda"
                icon={Building}
                required
                suggestion="Il nome completo della tua azienda o attività"
                value={formData.nome}
                error={errors.nome}
                onChange={handleInputChange}
              />
              
              <InputField
                field="email"
                label="Email di Contatto"
                type="email"
                placeholder="contatto@azienda.com"
                icon={Mail}
                required
                suggestion="Email principale per le comunicazioni"
                value={formData.email}
                error={errors.email}
                onChange={handleInputChange}
              />
            </div>

            <SelectField
              field="settore"
              label="Settore di Attività"
              options={sectors}
              required
              suggestion="Seleziona il settore che meglio descrive la tua attività"
              value={formData.settore}
              error={errors.settore}
              onChange={handleInputChange}
            />

            {formData.settore === 'Altro' && (
              <InputField
                field="settoreAltro"
                label="Specifica il Settore"
                placeholder="Descrivi il tuo settore di attività"
                icon={Building}
                required
                suggestion="Fornisci una descrizione dettagliata del tuo settore"
                value={formData.settoreAltro}
                error={errors.settoreAltro}
                onChange={handleInputChange}
              />
            )}
          </div>

          {/* Optional Fields Section */}
          <div className="pt-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
              <Globe className="h-6 w-6 text-slate-500 mr-2" />
              Profili Social e Web (Opzionale)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                field="sitoWeb"
                label="Sito Web"
                type="url"
                placeholder="https://www.azienda.com"
                icon={Globe}
                suggestion="URL completo del tuo sito web"
                value={formData.sitoWeb}
                error={errors.sitoWeb}
                onChange={handleInputChange}
              />
              
              <InputField
                field="linkedin"
                label="LinkedIn"
                type="url"
                placeholder="https://linkedin.com/company/azienda"
                icon={Linkedin}
                suggestion="Profilo LinkedIn aziendale"
                value={formData.linkedin}
                error={errors.linkedin}
                onChange={handleInputChange}
              />
              
              <InputField
                field="facebook"
                label="Facebook"
                type="url"
                placeholder="https://facebook.com/azienda"
                icon={Facebook}
                suggestion="Pagina Facebook aziendale"
                value={formData.facebook}
                error={errors.facebook}
                onChange={handleInputChange}
              />
              
              <InputField
                field="instagram"
                label="Instagram"
                type="url"
                placeholder="https://instagram.com/azienda"
                icon={Instagram}
                suggestion="Profilo Instagram aziendale"
                value={formData.instagram}
                error={errors.instagram}
                onChange={handleInputChange}
              />
              
              <InputField
                field="twitter"
                label="Twitter / X"
                type="url"
                placeholder="https://twitter.com/azienda"
                icon={Twitter}
                suggestion="Profilo Twitter/X aziendale"
                value={formData.twitter}
                error={errors.twitter}
                onChange={handleInputChange}
              />
              
              <InputField
                field="tiktok"
                label="TikTok"
                type="url"
                placeholder="https://tiktok.com/@azienda"
                icon={Music}
                suggestion="Profilo TikTok aziendale"
                value={formData.tiktok}
                error={errors.tiktok}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-lg text-white bg-primary hover:bg-primary-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Invio in corso...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Invia Richiesta di Attivazione
                  </>
                )}
              </button>
              
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-slate-300 text-base font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Torna alla Home
              </Link>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg flex items-center ${
              isSuccess 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {isSuccess ? (
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              )}
              <span className="text-sm font-medium">{message}</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;