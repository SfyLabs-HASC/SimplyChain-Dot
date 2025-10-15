import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { X, Plus, FileText, Calendar, MapPin, Hash, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import sha256 from 'js-sha256'; // SHA256 hashing for document verification

interface Step {
  nome: string;
  descrizione: string;
  data: string;
  luogo: string;
  hashDocumento: string;
}

interface BatchCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const BatchCreationModal: React.FC<BatchCreationModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { company } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [infoModal, setInfoModal] = useState<{open:boolean; title:string; body:string}>({ open: false, title: '', body: '' });
  
  // Batch fields
  const [nome, setNome] = useState('');
  const [descrizione, setDescrizione] = useState('');
  const [luogo, setLuogo] = useState('');
  const [data, setData] = useState('');
  const MAX_NOME = 70;
  const MAX_DESCRIZIONE = 250;
  const MAX_LUOGO = 50;
  const MAX_DATA = 50;
  const [hashDocumento, setHashDocumento] = useState('');
  
  // Steps
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>({
    nome: '',
    descrizione: '',
    data: '',
    luogo: '',
    hashDocumento: ''
  });

  const resetForm = () => {
    setNome('');
    setDescrizione('');
    setLuogo('');
    setData('');
    setHashDocumento('');
    setSteps([]);
    setCurrentStep({
      nome: '',
      descrizione: '',
      data: '',
      luogo: '',
      hashDocumento: ''
    });
    setMessage('');
    setIsSuccess(false);
    setShowRecap(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addStep = () => {
    if (currentStep.nome && currentStep.descrizione && currentStep.data && currentStep.luogo) {
      setSteps([...steps, { ...currentStep }]);
      setCurrentStep({
        nome: '',
        descrizione: '',
        data: '',
        luogo: '',
        hashDocumento: ''
      });
      setShowStepModal(false);
    } else {
      setMessage('Compila tutti i campi obbligatori');
      setIsSuccess(false);
    }
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const generateHash = (data: any) => {
    return sha256(JSON.stringify(data));
  };

  const handleSubmit = async () => {
    if (!nome || !descrizione || !luogo || !data) {
      setMessage('Compila tutti i campi obbligatori');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    try {
      const iscrizioneData = {
        nome,
        descrizione,
        luogo,
        data,
        hashDocumento: hashDocumento || generateHash({ nome, descrizione, luogo, data }),
        steps,
        companyId: company?.id,
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/record-iscrizione', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(iscrizioneData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Iscrizione creata con successo!');
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          handleClose();
        }, 2000);
      } else {
        const error = await response.json();
        setMessage(error.message || 'Errore durante la creazione dell\'iscrizione');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error creating iscrizione:', error);
      setMessage('Errore durante la creazione dell\'iscrizione');
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nuova Iscrizione</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {message && (
            <div className={`mb-4 p-4 rounded-lg flex items-center ${
              isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {isSuccess ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={isSuccess ? 'text-green-700' : 'text-red-700'}>{message}</span>
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Evento *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  maxLength={MAX_NOME}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Inserisci il nome dell'evento"
                />
                <p className="text-xs text-gray-500 mt-1">{nome.length}/{MAX_NOME} caratteri</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Luogo *
                </label>
                <input
                  type="text"
                  value={luogo}
                  onChange={(e) => setLuogo(e.target.value)}
                  maxLength={MAX_LUOGO}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Inserisci il luogo"
                />
                <p className="text-xs text-gray-500 mt-1">{luogo.length}/{MAX_LUOGO} caratteri</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hash Documento
                </label>
                <input
                  type="text"
                  value={hashDocumento}
                  onChange={(e) => setHashDocumento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hash del documento (opzionale)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione *
              </label>
              <textarea
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                maxLength={MAX_DESCRIZIONE}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserisci la descrizione dell'evento"
              />
              <p className="text-xs text-gray-500 mt-1">{descrizione.length}/{MAX_DESCRIZIONE} caratteri</p>
            </div>

            {/* Steps Management */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Step dell'Evento</h3>
                <button
                  onClick={() => setShowStepModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Step
                </button>
              </div>

              {steps.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nessuno step aggiunto</p>
                  <p className="text-sm text-gray-400">Gli step sono opzionali ma consigliati</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {steps.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{step.nome}</h4>
                          <p className="text-sm text-gray-600">{step.descrizione}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {step.data}
                            </span>
                            <span className="flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {step.luogo}
                            </span>
                            {step.hashDocumento && (
                              <span className="flex items-center">
                                <Hash className="h-3 w-3 mr-1" />
                                {step.hashDocumento.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => removeStep(index)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Annulla
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Creazione...' : 'Crea Iscrizione'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aggiungi Step</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Step *
                </label>
                <input
                  type="text"
                  value={currentStep.nome}
                  onChange={(e) => setCurrentStep({ ...currentStep, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome del step"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrizione *
                </label>
                <textarea
                  value={currentStep.descrizione}
                  onChange={(e) => setCurrentStep({ ...currentStep, descrizione: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descrizione del step"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={currentStep.data}
                    onChange={(e) => setCurrentStep({ ...currentStep, data: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Luogo *
                  </label>
                  <input
                    type="text"
                    value={currentStep.luogo}
                    onChange={(e) => setCurrentStep({ ...currentStep, luogo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Luogo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hash Documento
                </label>
                <input
                  type="text"
                  value={currentStep.hashDocumento}
                  onChange={(e) => setCurrentStep({ ...currentStep, hashDocumento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hash del documento (opzionale)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowStepModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Annulla
              </button>
              <button
                onClick={addStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Aggiungi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchCreationModal;