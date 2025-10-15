import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Building, CreditCard, Calendar, Plus, Loader2, AlertCircle, Hash, FileText, MapPin, ExternalLink, X, Copy, FileUp, Users, Activity } from 'lucide-react';
import TransactionManager from '../components/TransactionManager';
import BatchCreationModal from '../components/BatchCreationModal';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

interface Iscrizione {
  id: string;
  nome: string;
  email: string;
  telefono: string;
  data: string;
  steps: any[];
  hash?: string;
  txHash?: string;
}

const Dashboard: React.FC = () => {
  const { user, company, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [iscrizioni, setIscrizioni] = useState<Iscrizione[]>([]);
  const [iscrizioniLoading, setIscrizioniLoading] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [stepsModal, setStepsModal] = useState<{open: boolean; steps: any[]}>({ open: false, steps: [] });
  const [hashModal, setHashModal] = useState<{open: boolean; hash: string}>({ open: false, hash: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState<'iscrizioni' | 'notarizza' | null>(null);
  const [notarizzaName, setNotarizzaName] = useState('');
  const [notarizzaHash, setNotarizzaHash] = useState('');
  const [notarizzaLoading, setNotarizzaLoading] = useState(false);
  const [notarizzaMsg, setNotarizzaMsg] = useState<string>('');
  const [notarizzaOk, setNotarizzaOk] = useState<boolean>(false);
  const [notarizzaSearch, setNotarizzaSearch] = useState('');
  const [notarizzazioni, setNotarizzazioni] = useState<any[]>([]);
  const [notarizzazioniLoading, setNotarizzazioniLoading] = useState(false);
  const [notarizzaPage, setNotarizzaPage] = useState(1);
  const [emailModal, setEmailModal] = useState<{open:boolean; hash:string; txHash?:string}>({ open:false, hash:'', txHash: undefined });
  const [exportModal, setExportModal] = useState<{open:boolean; title:string; payload?: any}>({ open:false, title:'', payload: undefined });

  const pageSize = 20;

  useEffect(() => {
    if (!authLoading) {
      if (!user || !company?.isActive) {
        navigate('/form');
        return;
      }
      loadIscrizioni();
    }
  }, [user, company, authLoading, navigate]);

  const loadIscrizioni = async () => {
    setIscrizioniLoading(true);
    try {
      const response = await fetch(`/api/get-iscrizioni?companyId=${company?.id}`);
      if (response.ok) {
        const data = await response.json();
        setIscrizioni(data.iscrizioni || []);
      }
    } catch (error) {
      console.error('Error loading iscrizioni:', error);
    } finally {
      setIscrizioniLoading(false);
    }
  };

  const loadNotarizzazioni = async () => {
    setNotarizzazioniLoading(true);
    try {
      const response = await fetch(`/api/get-notarizzazioni?companyId=${company?.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotarizzazioni(data.notarizzazioni || []);
      }
    } catch (error) {
      console.error('Error loading notarizzazioni:', error);
    } finally {
      setNotarizzazioniLoading(false);
    }
  };

  const handleNotarizza = async () => {
    if (!notarizzaName || !notarizzaHash) {
      setNotarizzaMsg('Inserisci nome e hash');
      setNotarizzaOk(false);
      return;
    }

    setNotarizzaLoading(true);
    try {
      const response = await fetch('/api/notarizza', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company?.id,
          nome: notarizzaName,
          hash: notarizzaHash
        })
      });

      if (response.ok) {
        const data = await response.json();
        setNotarizzaMsg('Notarizzazione completata con successo');
        setNotarizzaOk(true);
        setNotarizzaName('');
        setNotarizzaHash('');
        loadNotarizzazioni();
      } else {
        setNotarizzaMsg('Errore durante la notarizzazione');
        setNotarizzaOk(false);
      }
    } catch (error) {
      setNotarizzaMsg('Errore durante la notarizzazione');
      setNotarizzaOk(false);
    } finally {
      setNotarizzaLoading(false);
    }
  };

  const exportToPDF = async (iscrizione: Iscrizione) => {
    try {
      const pdf = new jsPDF();
      pdf.setFontSize(20);
      pdf.text('Certificato di Iscrizione', 20, 30);
      
      pdf.setFontSize(12);
      pdf.text(`Nome: ${iscrizione.nome}`, 20, 50);
      pdf.text(`Email: ${iscrizione.email}`, 20, 60);
      pdf.text(`Telefono: ${iscrizione.telefono}`, 20, 70);
      pdf.text(`Data: ${iscrizione.data}`, 20, 80);
      
      if (iscrizione.hash) {
        pdf.text(`Hash: ${iscrizione.hash}`, 20, 90);
      }
      
      pdf.save(`iscrizione_${iscrizione.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const generateQRCode = async (iscrizione: Iscrizione) => {
    try {
      const qrData = JSON.stringify({
        id: iscrizione.id,
        nome: iscrizione.nome,
        email: iscrizione.email,
        hash: iscrizione.hash
      });
      
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
      
      const link = document.createElement('a');
      link.download = `qr_${iscrizione.id}.png`;
      link.href = qrCodeDataURL;
      link.click();
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const filteredIscrizioni = iscrizioni.filter(iscrizione =>
    iscrizione.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    iscrizione.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedIscrizioni = filteredIscrizioni.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredIscrizioni.length / pageSize);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user || !company?.isActive) {
    return null; // Will redirect to form
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Benvenuto, {company.nome}! Gestisci le tue iscrizioni e transazioni.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Iscrizioni Totali</p>
                <p className="text-2xl font-bold text-gray-900">{iscrizioni.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Crediti Disponibili</p>
                <p className="text-2xl font-bold text-gray-900">{company.crediti || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Settore</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{company.settore}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transaction Manager */}
          <TransactionManager companyId={company.id} />

          {/* Iscrizioni Management */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Gestione Iscrizioni</h2>
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuova Iscrizione
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cerca iscrizioni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {iscrizioniLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Caricamento iscrizioni...</p>
                </div>
              ) : paginatedIscrizioni.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nessuna iscrizione trovata</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedIscrizioni.map((iscrizione) => (
                    <div key={iscrizione.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{iscrizione.nome}</h3>
                          <p className="text-sm text-gray-600">{iscrizione.email}</p>
                          <p className="text-sm text-gray-500">{iscrizione.telefono}</p>
                          <p className="text-xs text-gray-400">{iscrizione.data}</p>
                          {iscrizione.hash && (
                            <p className="text-xs text-blue-600 font-mono">{iscrizione.hash}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => exportToPDF(iscrizione)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Esporta PDF"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => generateQRCode(iscrizione)}
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Genera QR Code"
                          >
                            <FileUp className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Precedente
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
                      Pagina {currentPage} di {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Successiva
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Batch Creation Modal */}
        <BatchCreationModal
          isOpen={showBatchModal}
          onClose={() => setShowBatchModal(false)}
          onSuccess={() => {
            loadIscrizioni();
            setShowBatchModal(false);
          }}
        />
      </div>
    </div>
  );
};

export default Dashboard;