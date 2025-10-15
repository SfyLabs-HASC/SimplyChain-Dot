import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { getContract } from 'thirdweb/contract';
import { createThirdwebClient } from 'thirdweb';
import { arbitrum } from 'thirdweb/chains';
import { prepareContractCall } from 'thirdweb';
import { readContract } from 'thirdweb';
import { X, Plus, FileText, Calendar, MapPin, Hash, Loader2, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import sha256 from 'js-sha256';

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
  onIscrizioneCreated?: (txHash: string) => void;
}

const BatchCreationModal: React.FC<BatchCreationModalProps> = ({ isOpen, onClose, onIscrizioneCreated }) => {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [infoModal, setInfoModal] = useState<{open:boolean; title:string; body:string}>({ open: false, title: '', body: '' });
  const [estimatedCalldataBytes, setEstimatedCalldataBytes] = useState<number>(0);
  const MAX_CALLDATA_BYTES = 100_000; // soglia prudente
  const [insufficientCredits, setInsufficientCredits] = useState<boolean>(false);
  
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stepFileInputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef<boolean>(false);

  const resetForm = () => {
    setLoading(false);
    setMessage('');
    setIsSuccess(false);
    setShowRecap(false);
    setShowStepModal(false);
    setInfoModal({ open: false, title: '', body: '' });
    setEstimatedCalldataBytes(0);
    setInsufficientCredits(false);
    setNome('');
    setDescrizione('');
    setLuogo('');
    setData('');
    setHashDocumento('');
    setSteps([]);
    setCurrentStep({ nome: '', descrizione: '', data: '', luogo: '', hashDocumento: '' });
  };

  const client = createThirdwebClient({ clientId: (import.meta as any).env?.VITE_THIRDWEB_CLIENT_ID || '' });
  const contract = getContract({ client, chain: arbitrum, address: '0x71efb9364a896973b80786541c3a431bcf6c7efa' });
  const { mutateAsync: sendTransaction } = useSendTransaction();
  // Close on Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (loading) return; // block closing while processing
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, loading]);

  // Reset all state whenever the modal transitions from closed -> open
  React.useEffect(() => {
    if (isOpen && !prevOpenRef.current) {
      resetForm();
    }
    prevOpenRef.current = isOpen;
  }, [isOpen]);

  // Correct ABI matching the deployed contract
  const contractABI = [
    {
      inputs: [
        { internalType: 'string', name: '_nome', type: 'string' },
        { internalType: 'string', name: '_descrizione', type: 'string' },
        { internalType: 'string', name: '_data', type: 'string' },
        { internalType: 'string', name: '_luogo', type: 'string' },
        { internalType: 'string', name: '_hashDocumento', type: 'string' },
        {
          components: [
            { internalType: 'string', name: 'nome', type: 'string' },
            { internalType: 'string', name: 'descrizione', type: 'string' },
            { internalType: 'string', name: 'data', type: 'string' },
            { internalType: 'string', name: 'luogo', type: 'string' },
            { internalType: 'string', name: 'hashDocumento', type: 'string' },
          ],
          internalType: 'struct SimplyChainV5.Step[]',
          name: '_steps',
          type: 'tuple[]',
        },
      ],
      name: 'creaBatch',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ] as const;

  // Recompute estimated calldata bytes when inputs change
  React.useEffect(() => {
    try {
      const formattedSteps = steps.map(step => ({
        nome: (step.nome || '').trim(),
        descrizione: (step.descrizione || '').trim(),
        data: formatDateForContract(step.data),
        luogo: (step.luogo || '').trim(),
        hashDocumento: (step.hashDocumento || '').trim(),
      }));
      const dataHex = encodeFunctionData({
        abi: contractABI as any,
        functionName: 'creaBatch',
        args: [
          (nome || '').trim(),
          (descrizione || '').trim(),
          formatDateForContract(data),
          (luogo || '').trim(),
          (hashDocumento || '').trim(),
          formattedSteps,
        ],
      });
      const bytes = Math.max(0, (dataHex.length - 2) / 2);
      setEstimatedCalldataBytes(bytes);
    } catch {
      setEstimatedCalldataBytes(0);
    }
  }, [nome, descrizione, data, luogo, hashDocumento, steps]);

  const generateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileUpload = async (file: File, isStep: boolean = false) => {
    try {
      const hash = await generateHash(file);
      if (isStep) {
        setCurrentStep(prev => ({ ...prev, hashDocumento: hash }));
      } else {
        setHashDocumento(hash);
      }
      setMessage('Hash generato con successo');
      setIsSuccess(true);
    } catch (error) {
      console.error('Error generating hash:', error);
      setMessage('Errore nella generazione dell\'hash');
      setIsSuccess(false);
    }
  };

  const addStep = () => {
    if (steps.length >= 5) {
      setMessage('Massimo 5 step consentiti');
      setIsSuccess(false);
      return;
    }
    
    if (currentStep.nome.trim()) {
      setSteps(prev => [...prev, { ...currentStep }]);
      setCurrentStep({
        nome: '',
        descrizione: '',
        data: '',
        luogo: '',
        hashDocumento: ''
      });
      setShowStepModal(false);
    }
  };

  const removeStep = (index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const formatDateForContract = (dateString: string) => {
    if (!dateString) return '';
    // Keep the original date string format for better visibility on Arbiscan
    return dateString;
  };

  const formatDateItalian = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  };

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setMessage('Il nome dell\'iscrizione è obbligatorio');
      setIsSuccess(false);
      return;
    }
    if (!luogo.trim()) {
      setMessage('Il luogo è obbligatorio');
      setIsSuccess(false);
      return;
    }
    if (!data.trim()) {
      setMessage('La data è obbligatoria');
      setIsSuccess(false);
      return;
    }
    if (!descrizione.trim()) {
      setMessage('La descrizione è obbligatoria');
      setIsSuccess(false);
      return;
    }
    // Entra nel riepilogo pulendo eventuali messaggi precedenti
    setMessage('');
    setIsSuccess(false);
    setShowRecap(true);
  };

  const confirmTransaction = async () => {
    if (!account?.address) {
      setMessage('Devi essere connesso per creare un batch');
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setMessage('Preparazione transazione...');
    setIsSuccess(false);
    let didSucceed = false;

    // Check credits before sending on-chain
    try {
      const resp = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
      if (resp.ok) {
        const json = await resp.json();
        const credits = Number(json?.company?.crediti || 0);
        if (!json?.isActive) {
          setMessage('La tua azienda non è attiva.');
          setIsSuccess(false);
          setLoading(false);
          return;
        }
        if (credits <= 0) {
          setInsufficientCredits(true);
          setMessage('');
          setIsSuccess(false);
          setLoading(false);
          return;
        }
      }
    } catch {}

    try {
      // Preflight: block if calldata too large
      if (estimatedCalldataBytes > MAX_CALLDATA_BYTES) {
        setMessage('Iscrizione troppo grande: riduci testi o numero di step.');
        setIsSuccess(false);
        setLoading(false);
        return;
      }
      const formattedSteps = steps.map(step => ({
        nome: (step.nome || '').trim(),
        descrizione: (step.descrizione || '').trim(),
        data: formatDateForContract(step.data),
        luogo: (step.luogo || '').trim(),
        hashDocumento: (step.hashDocumento || '').trim()
      }));

      console.log('Creating transaction with params:', {
        nome: nome.trim(),
        descrizione: descrizione.trim(),
        data: formatDateForContract(data),
        luogo: luogo.trim(),
        hashDocumento: (hashDocumento || '').trim(),
        steps: formattedSteps
      });

      const transaction = prepareContractCall({
        contract,
        method: "function creaBatch(string _nome, string _descrizione, string _data, string _luogo, string _hashDocumento, (string nome, string descrizione, string data, string luogo, string hashDocumento)[] _steps) returns (uint256)",
        params: [
          nome.trim(),
          descrizione.trim(),
          formatDateForContract(data),
          luogo.trim(),
          (hashDocumento || '').trim(),
          formattedSteps
        ],
      });

      setMessage('Invio transazione on-chain...');
      console.log('Sending transaction:', transaction);
      
      let txResult: any;
      try {
        txResult = await sendTransaction(transaction);
      } catch (err: any) {
        const msg = String(err?.shortMessage || err?.message || err || 'Errore transazione');
        if (/out of gas|intrinsic gas too low|data too long|exceeds block gas/i.test(msg)) {
          setMessage('Transazione fallita: contenuto troppo grande. Riduci testi o dividi in più iscrizioni.');
        } else {
          setMessage(`Errore transazione: ${msg}`);
        }
        setIsSuccess(false);
        setLoading(false);
        return;
      }
      
      const txHash = (txResult as any)?.transactionHash || (txResult as any)?.hash || '';
      
      setMessage(txHash
        ? `Iscrizione creata! Hash: ${txHash}`
        : 'Iscrizione creata con successo sulla blockchain!');
      setIsSuccess(true);
      setLoading(true); // keep loader until we close
      didSucceed = true;

      // Determina il batchId on-chain appena creato per questa azienda
      let newBatchId: string | undefined;
      try {
        const batchIds: any = await readContract({
          contract,
          method: 'function getBatchesAzienda(address) view returns (uint256[])',
          params: [account.address],
        });
        if (Array.isArray(batchIds) && batchIds.length > 0) {
          // Prendiamo l'ID più alto come ultimo creato
          const maxId = batchIds.reduce((m: bigint, v: bigint) => (v > m ? v : m), 0n);
          newBatchId = String(maxId);
        }
      } catch (e) {
        console.warn('Impossibile recuperare batchId appena creato:', e);
      }

      // Salva su Firebase + scala 1 credito
      try {
        await fetch('/api/record-iscrizione', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: account.address,
            txHash: txHash || null,
            iscrizione: {
              batchId: newBatchId,
              nome: nome.trim(),
              descrizione: descrizione.trim(),
              data: formatDateForContract(data),
              luogo: luogo.trim(),
              hashDocumento: (hashDocumento || '').trim(),
              steps: steps.map(s => ({
                nome: (s.nome || '').trim(),
                descrizione: (s.descrizione || '').trim(),
                data: formatDateForContract(s.data),
                luogo: (s.luogo || '').trim(),
                hashDocumento: (s.hashDocumento || '').trim(),
              })),
            },
          }),
        });
      } catch (e) {
        console.error('Errore salvataggio iscrizione:', e);
      }
      
      // Reset form
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
      
      // Notify parent component and trigger page-level refresh
      try {
        window.dispatchEvent(new Event('iscrizioneCompleted'));
      } catch {}
      if (onIscrizioneCreated && txHash) {
        onIscrizioneCreated(txHash);
      }

      setTimeout(() => {
        onClose();
        setShowRecap(false);
        // No need to reload page anymore - cache invalidation handles it
      }, 3000);
      
    } catch (error) {
      console.error('Error creating batch:', error);
      setMessage(`Errore nella creazione dell'iscrizione: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      setIsSuccess(false);
    } finally {
      // Mantieni il loader se l'operazione è andata a buon fine (verificato con flag locale)
      if (!didSucceed) setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => { if (!loading) onClose(); }}>
      {!(showRecap && loading) && (
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-slate-900">
            {showRecap ? 'Riepilogo Iscrizione' : 'Crea Nuova Iscrizione'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {!showRecap ? (
            <>
              {/* Batch Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Informazioni Iscrizione
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setInfoModal({ open: true, title: 'Nome', body: `Come scegliere il Nome Iscrizione\n\nIl Nome Iscrizione è un'etichetta descrittiva che ti aiuta a identificare in modo chiaro ciò che stai registrando on-chain. Ad esempio:\n\nIl nome di un prodotto o varietà: Pomodori San Marzano 2025, Olio Extravergine Frantoio\nUn lotto o una produzione: Lotto Pasta Artigianale LT1025, Produzione Vino Rosso 2024\nUn servizio o processo: Trasporto Merci Roma-Milano, Certificazione Biologico 2025\n\nConsiglio: scegli un nome breve ma significativo, che ti permetta di ritrovare facilmente l'iscrizione anche dopo mesi o anni.` })} className="text-left hover:underline">
                          Nome
                        </button>
                        <button type="button" aria-label="Info Nome" onClick={() => setInfoModal({ open: true, title: 'Nome', body: `Come scegliere il Nome Iscrizione\n\nIl Nome Iscrizione è un'etichetta descrittiva che ti aiuta a identificare in modo chiaro ciò che stai registrando on-chain. Ad esempio:\n\nIl nome di un prodotto o varietà: Pomodori San Marzano 2025, Olio Extravergine Frantoio\nUn lotto o una produzione: Lotto Pasta Artigianale LT1025, Produzione Vino Rosso 2024\nUn servizio o processo: Trasporto Merci Roma-Milano, Certificazione Biologico 2025\n\nConsiglio: scegli un nome breve ma significativo, che ti permetta di ritrovare facilmente l'iscrizione anche dopo mesi o anni.` })} className="ml-1 text-primary">
                          <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                        </button>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value.slice(0, MAX_NOME))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nome dell'iscrizione"
                      maxLength={MAX_NOME}
                    />
                    <p className="text-xs text-slate-500 mt-1">{nome.length}/{MAX_NOME}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setInfoModal({ open: true, title: 'Luogo', body: `Inserisci il luogo di origine o produzione, come una città, una regione, un'azienda agricola o uno stabilimento. Serve a indicare con precisione dove ha avuto origine ciò che stai registrando.` })} className="text-left hover:underline">
                          Luogo
                        </button>
                        <button type="button" aria-label="Info Luogo" onClick={() => setInfoModal({ open: true, title: 'Luogo', body: `Inserisci il luogo di origine o produzione, come una città, una regione, un'azienda agricola o uno stabilimento. Serve a indicare con precisione dove ha avuto origine ciò che stai registrando.` })} className="ml-1 text-primary">
                          <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                        </button>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={luogo}
                      onChange={(e) => setLuogo(e.target.value.slice(0, MAX_LUOGO))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Luogo dell'iscrizione"
                      maxLength={MAX_LUOGO}
                    />
                    <p className="text-xs text-slate-500 mt-1">{luogo.length}/{MAX_LUOGO}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setInfoModal({ open: true, title: 'Data', body: `Inserisci una data di origine, puoi utilizzare il giorno attuale o una data precedente alla registrazione di questa iscrizione.` })} className="text-left hover:underline">
                          Data
                        </button>
                        <button type="button" aria-label="Info Data" onClick={() => setInfoModal({ open: true, title: 'Data', body: `Inserisci una data di origine, puoi utilizzare il giorno attuale o una data precedente alla registrazione di questa iscrizione.` })} className="ml-1 text-primary">
                          <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                        </button>
                      </div>
                    </label>
                    <input
                      type="date"
                      value={data}
                      onChange={(e) => setData(e.target.value.slice(0, MAX_DATA))}
                      max={getCurrentDate()}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {data && (<p className="text-xs text-slate-500 mt-1">{formatDateItalian(data)}</p>)}
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setInfoModal({ open: true, title: 'Hash Documento', body: `Puoi certificare un documento direttamente all'interno di questa iscrizione.\nUna volta che caricherai il documento, che può essere un file di qualsiasi genere, come una immagine, un foglio csv o un contratto PDF, ti sarà restituito uno SHA256 Hash.\nL'impronta di quel documento sarà iscritta nella blockchain per sempre. Il documento non potrà essere cambiato senza cambiare questo Hash.` })} className="text-left hover:underline">
                        Hash Documento <span className="text-slate-500 font-normal">(opzionale)</span>
                      </button>
                      <button type="button" aria-label="Info Hash Documento" onClick={() => setInfoModal({ open: true, title: 'Hash Documento', body: `Puoi certificare un documento direttamente all'interno di questa iscrizione.\nUna volta che caricherai il documento, che può essere un file di qualsiasi genere, come una immagine, un foglio csv o un contratto PDF, ti sarà restituito uno SHA256 Hash.\nL'impronta di quel documento sarà iscritta nella blockchain per sempre. Il documento non potrà essere cambiato senza cambiare questo Hash.` })} className="ml-1 text-primary">
                        <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                      </button>
                    </div>
                  </label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        accept="*/*"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        {hashDocumento ? 'Hash generato ✓' : 'Carica documento'}
                      </button>
                    </div>
                    {hashDocumento && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center">
                        <Hash className="h-3 w-3 mr-1" />
                        {hashDocumento.substring(0, 20)}...
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setInfoModal({ open: true, title: 'Descrizione', body: `Inserisci una descrizione dettagliata di ciò che stai registrando. Fornisci tutte le informazioni utili per identificare chiaramente il prodotto, il servizio o il processo a cui appartiene questa iscrizione.` })} className="text-left hover:underline">
                        Descrizione
                      </button>
                      <button type="button" aria-label="Info Descrizione" onClick={() => setInfoModal({ open: true, title: 'Descrizione', body: `Inserisci una descrizione dettagliata di ciò che stai registrando. Fornisci tutte le informazioni utili per identificare chiaramente il prodotto, il servizio o il processo a cui appartiene questa iscrizione.` })} className="ml-1 text-primary">
                        <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                      </button>
                    </div>
                  </label>
                  <textarea
                    value={descrizione}
                    onChange={(e) => setDescrizione(e.target.value.slice(0, MAX_DESCRIZIONE))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Descrizione dell'iscrizione"
                    maxLength={MAX_DESCRIZIONE}
                  />
                  <p className="text-xs text-slate-500 mt-1">{descrizione.length}/{MAX_DESCRIZIONE}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-primary" />
                  Steps ({steps.length})
                </h3>

                {/* Add Step Button */}
                <div className="mb-4">
                  <button
                    onClick={() => setShowStepModal(true)}
                    disabled={steps.length >= 5}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Step ({steps.length}/5)
                  </button>
                  {steps.length >= 5 && (
                    <p className="text-xs text-red-500 mt-1">Massimo 5 step consentiti</p>
                  )}
                </div>

                {/* Steps List */}
                {steps.length > 0 && (
                  <div className="space-y-3">
                    {steps.map((step, index) => (
                      <div key={index} className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-slate-900">{step.nome || 'N/D'}</h5>
                            <p className="text-sm text-slate-600 mt-1">{step.descrizione || 'N/D'}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {step.luogo || 'N/D'}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {step.data ? formatDateForContract(step.data) : 'N/D'}
                              </span>
                              <span className="flex items-center">
                                <Hash className="h-3 w-3 mr-1" />
                                {step.hashDocumento ? 'Hash presente' : 'N/D'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeStep(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message (solo nella fase di compilazione, escluso riepilogo) */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center ${
                  isSuccess
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {isSuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                  <span className="text-sm">{message}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!nome.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Continua
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Recap (hidden while processing) */}
              {!loading && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Riepilogo Batch</h3>
                
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Informazioni Batch</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><strong>Nome:</strong> {nome || 'N/D'}</div>
                    <div><strong>Luogo:</strong> {luogo || 'N/D'}</div>
                    <div><strong>Data:</strong> {data ? formatDateItalian(data) : 'N/D'}</div>
                    <div><strong>Hash Documento:</strong> {hashDocumento ? 'Presente' : 'N/D'}</div>
                    <div className="md:col-span-2"><strong>Descrizione:</strong> {descrizione || 'N/D'}</div>
                  </div>
                </div>

                {steps.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Steps ({steps.length})</h4>
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <div key={index} className="text-sm">
                          <strong>Step {index + 1}:</strong> {step.nome || 'N/D'} - {step.luogo || 'N/D'} - {step.data ? formatDateItalian(step.data) : 'N/D'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded p-3">
                  Conferma: questa iscrizione consumerà <strong>1 credito</strong> dal tuo saldo.
                </div>

                {insufficientCredits && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded p-3">
                    Il tuo saldo crediti non permette di procedere con questa iscrizione.{' '}
                    <a href="/ricaricacrediti" className="font-semibold underline">Ricarica Crediti</a>
                  </div>
                )}
              </div>
              )}

              {/* Messaggi/Alert nella pagina di riepilogo */}
              {!loading && message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center ${
                  isSuccess
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {isSuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                  <span className="text-sm">{message}</span>
                </div>
              )}

              {/* Actions */}
              {!loading && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRecap(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Indietro
                </button>
                {/* Dimensione stimata rimossa su richiesta */}
                <button
                  onClick={confirmTransaction}
                  disabled={loading || estimatedCalldataBytes > MAX_CALLDATA_BYTES}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Invio transazione...
                    </>
                  ) : (
                    'Conferma e Crea Iscrizione'
                  )}
                </button>
              </div>
              )}
            </>
          )}
        </div>
      </div>
      )}

      {/* Processing Popup: shown during on-chain submission */}
      {loading && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900">Conferma Iscrizione</h4>
              <p className="mt-2 text-sm text-slate-600">Iscrizione in corso...</p>
            </div>
          </div>
        </div>
      )}

      {/* Step Modal */}
      {showStepModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setShowStepModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Aggiungi Step</h3>
                <button
                  onClick={() => setShowStepModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-slate-500" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setInfoModal({ open: true, title: 'Nome Step', body: `Come scegliere il Nome Step Iscrizione\n\nIl Nome Step Iscrizione è un'etichetta descrittiva che ti aiuta a identificare con chiarezza un passaggio specifico della filiera o un evento rilevante che desideri registrare on-chain. Ad esempio:\n\nUna fase produttiva: Raccolta uva – Vigna 3, Inizio mungitura – Allevamento Nord\nUn'attività logistica: Spedizione lotto LT1025 – 15/05/2025\nUn controllo o verifica: Ispezione qualità – Stabilimento A, Audit ICEA 2025\nUn evento documentale: Firma contratto fornitura – Cliente COOP, Approvazione certificato biologico\n\nConsiglio: scegli un nome breve ma significativo, che ti permetta di ritrovare facilmente lo step anche dopo mesi o anni.` })} className="text-left hover:underline">
                        Nome
                      </button>
                      <button type="button" aria-label="Info Nome Step" onClick={() => setInfoModal({ open: true, title: 'Nome Step', body: `Come scegliere il Nome Step Iscrizione\n\nIl Nome Step Iscrizione è un'etichetta descrittiva che ti aiuta a identificare con chiarezza un passaggio specifico della filiera o un evento rilevante che desideri registrare on-chain. Ad esempio:\n\nUna fase produttiva: Raccolta uva – Vigna 3, Inizio mungitura – Allevamento Nord\nUn'attività logistica: Spedizione lotto LT1025 – 15/05/2025\nUn controllo o verifica: Ispezione qualità – Stabilimento A, Audit ICEA 2025\nUn evento documentale: Firma contratto fornitura – Cliente COOP, Approvazione certificato biologico\n\nConsiglio: scegli un nome breve ma significativo, che ti permetta di ritrovare facilmente lo step anche dopo mesi o anni.` })} className="ml-1 text-primary">
                        <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                      </button>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={currentStep.nome}
                    onChange={(e) => setCurrentStep(prev => ({ ...prev, nome: e.target.value.slice(0, MAX_NOME) }))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="Nome step"
                    maxLength={MAX_NOME}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">{currentStep.nome.length}/{MAX_NOME}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setInfoModal({ open: true, title: 'Luogo Step', body: `Inserisci il luogo in cui si è svolto lo step, come una città, una regione, un'azienda agricola, uno stabilimento o un punto logistico. Serve a indicare con precisione dove è avvenuto il passaggio registrato.` })} className="text-left hover:underline">
                        Luogo
                      </button>
                      <button type="button" aria-label="Info Luogo Step" onClick={() => setInfoModal({ open: true, title: 'Luogo Step', body: `Inserisci il luogo in cui si è svolto lo step, come una città, una regione, un'azienda agricola, uno stabilimento o un punto logistico. Serve a indicare con precisione dove è avvenuto il passaggio registrato.` })} className="ml-1 text-primary">
                        <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                      </button>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={currentStep.luogo}
                    onChange={(e) => setCurrentStep(prev => ({ ...prev, luogo: e.target.value.slice(0, MAX_LUOGO) }))}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    placeholder="Luogo step"
                    maxLength={MAX_LUOGO}
                  />
                  <p className="text-[11px] text-slate-500 mt-1">{currentStep.luogo.length}/{MAX_LUOGO}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setInfoModal({ open: true, title: 'Data Step', body: `Inserisci una data, puoi utilizzare il giorno attuale o una data precedente alla conferma di questo step.` })} className="text-left hover:underline">
                        Data
                      </button>
                      <button type="button" aria-label="Info Data Step" onClick={() => setInfoModal({ open: true, title: 'Data Step', body: `Inserisci una data, puoi utilizzare il giorno attuale o una data precedente alla conferma di questo step.` })} className="ml-1 text-primary">
                        <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                      </button>
                    </div>
                  </label>
                  <input
                    type="date"
                    value={currentStep.data}
                    onChange={(e) => setCurrentStep(prev => ({ ...prev, data: e.target.value.slice(0, MAX_DATA) }))}
                    max={getCurrentDate()}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                  {currentStep.data && (<p className="text-[11px] text-slate-500 mt-1">{formatDateItalian(currentStep.data)}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setInfoModal({ open: true, title: 'Hash Documento Step', body: `Puoi certificare un documento direttamente all'interno di questo step.\nUna volta che caricherai il documento, che può essere un file di qualsiasi genere, come una immagine, un foglio csv o un contratto PDF, ti sarà restituito uno SHA256 Hash.\nL'impronta di quel documento sarà iscritta nella blockchain per sempre. Il documento non potrà essere cambiato senza cambiare questo Hash.` })} className="text-left hover:underline">
                        Hash Documento <span className="text-slate-500 font-normal">(opzionale)</span>
                      </button>
                      <button type="button" aria-label="Info Hash Documento Step" onClick={() => setInfoModal({ open: true, title: 'Hash Documento Step', body: `Puoi certificare un documento direttamente all'interno di questo step.\nUna volta che caricherai il documento, che può essere un file di qualsiasi genere, come una immagine, un foglio csv o un contratto PDF, ti sarà restituito uno SHA256 Hash.\nL'impronta di quel documento sarà iscritta nella blockchain per sempre. Il documento non potrà essere cambiato senza cambiare questo Hash.` })} className="ml-1 text-primary">
                        <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                      </button>
                    </div>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={stepFileInputRef}
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], true)}
                      className="hidden"
                      accept="*/*"
                    />
                    <button
                      onClick={() => stepFileInputRef.current?.click()}
                      className="flex-1 px-3 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left text-sm"
                    >
                      {currentStep.hashDocumento ? 'Hash generato ✓' : 'Carica documento'}
                    </button>
                  </div>
                  {currentStep.hashDocumento && (
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center">
                      <Hash className="h-3 w-3 mr-1" />
                      {currentStep.hashDocumento.substring(0, 20)}...
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setInfoModal({ open: true, title: 'Descrizione Step', body: `Inserisci una descrizione dello step, come una fase produttiva, logistica, amministrativa o documentale. Fornisci tutte le informazioni utili per identificarlo chiaramente all'interno del processo o della filiera a cui appartiene.` })} className="text-left hover:underline">
                      Descrizione
                    </button>
                    <button type="button" aria-label="Info Descrizione Step" onClick={() => setInfoModal({ open: true, title: 'Descrizione Step', body: `Inserisci una descrizione dello step, come una fase produttiva, logistica, amministrativa o documentale. Fornisci tutte le informazioni utili per identificarlo chiaramente all'interno del processo o della filiera a cui appartiene.` })} className="ml-1 text-primary">
                      <span className="material-symbols-outlined text-[16px] align-middle">info</span>
                    </button>
                  </div>
                </label>
                <textarea
                  value={currentStep.descrizione}
                  onChange={(e) => setCurrentStep(prev => ({ ...prev, descrizione: e.target.value.slice(0, MAX_DESCRIZIONE) }))}
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  placeholder="Descrizione step"
                  maxLength={MAX_DESCRIZIONE}
                />
                <p className="text-[11px] text-slate-500 mt-1">{currentStep.descrizione.length}/{MAX_DESCRIZIONE}</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-200 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setShowStepModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={addStep}
                disabled={!currentStep.nome.trim() || !currentStep.descrizione.trim()}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aggiungi Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setInfoModal({ open:false, title:'', body:'' })}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
              <h4 className="text-xl font-bold text-slate-900">{infoModal.title}</h4>
              <button onClick={() => setInfoModal({ open:false, title:'', body:'' })} className="p-2 rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>
            <div className="p-4 sm:p-6 whitespace-pre-line text-slate-800 leading-relaxed text-sm flex-1 overflow-y-auto">
              {infoModal.body}
            </div>
            <div className="p-4 sm:p-6 border-t border-slate-200 text-right sticky bottom-0 bg-white">
              <button onClick={() => setInfoModal({ open:false, title:'', body:'' })} className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-700">Ho Capito</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchCreationModal;