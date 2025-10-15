import React, { useState, useEffect } from 'react';
import { useActiveAccount, useReadContract, useSendTransaction } from 'thirdweb/react';
import { getContract } from 'thirdweb/contract';
import { createThirdwebClient } from 'thirdweb';
import { arbitrum } from 'thirdweb/chains';
import { prepareContractCall } from 'thirdweb';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, User, Building, Mail, Globe, Linkedin, Facebook, Instagram, Twitter, Music, RefreshCw, Shield, ShieldCheck, CreditCard, Users, Clock, CheckCircle2, XCircle, Edit3, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Company {
  id: string;
  walletAddress: string;
  nome: string;
  email: string;
  settore: string;
  sitoWeb?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  isActive: boolean;
  pending: boolean;
  crediti?: number;
  createdAt?: Date;
  activatedAt?: Date;
}

const SfyAdmin: React.FC = () => {
  const account = useActiveAccount();
  const [newOwner, setNewOwner] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [companies, setCompanies] = useState<{ pending: Company[]; active: Company[] }>({ pending: [], active: [] });
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [editingCrediti, setEditingCrediti] = useState<string | null>(null);
  const [newCrediti, setNewCrediti] = useState('');
  const [editingCompany, setEditingCompany] = useState<string | null>(null);
  const [editingNome, setEditingNome] = useState('');
  const [editingEmail, setEditingEmail] = useState('');
  const [showPending, setShowPending] = useState(true);
  const [showActive, setShowActive] = useState(true);
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');
  const [activeSearchTerm, setActiveSearchTerm] = useState('');

  const client = createThirdwebClient({ clientId: (import.meta as any).env?.VITE_THIRDWEB_CLIENT_ID || '' });
  const contract = getContract({ client, chain: arbitrum, address: '0x71efb9364a896973b80786541c3a431bcf6c7efa' });
  
  const { data: ownerAddress } = useReadContract({
    contract,
    method: 'function owner() view returns (address)',
    params: [],
  });

  const { mutate: sendTransaction } = useSendTransaction();

  const isOwner = account?.address && ownerAddress && account.address.toLowerCase() === ownerAddress.toLowerCase();

  useEffect(() => {
    if (account?.address && ownerAddress) {
      console.log('Current account:', account.address);
      console.log('Contract owner:', ownerAddress);
      console.log('Is owner:', isOwner);
    }
  }, [account?.address, ownerAddress, isOwner]);

  // Load companies when component mounts or when owner status changes
  useEffect(() => {
    if (isOwner) {
      loadCompanies();
    }
  }, [isOwner]);

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await fetch('/api/get-pending-companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        console.error('Failed to load companies');
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleChangeOwner = async () => {
    if (!newOwner.trim()) {
      setMessage('Inserisci un indirizzo valido');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const transaction = prepareContractCall({
        contract,
        method: 'function cambiaOwner(address _nuovoOwner)',
        params: [newOwner],
      });

      await sendTransaction(transaction);
      setMessage('Owner cambiato con successo!');
      setIsSuccess(true);
      setNewOwner('');
    } catch (error) {
      console.error('Error changing owner:', error);
      setMessage('Errore durante il cambio di owner');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompanyAction = async (walletAddress: string, action: 'activate' | 'deactivate' | 'update-crediti' | 'delete', crediti?: number) => {
    if (!account?.address) {
      setMessage('Devi essere connesso per eseguire questa azione.');
      setIsSuccess(false);
      return;
    }
    
    let confirmMessage = '';
    if (action === 'activate') {
      confirmMessage = `Sei sicuro di voler attivare l'azienda con wallet ${walletAddress}? Questa azione eseguirà una transazione on-chain.`;
    } else if (action === 'deactivate') {
      confirmMessage = `Sei sicuro di voler disattivare l'azienda con wallet ${walletAddress}? Questa azione eseguirà una transazione on-chain.`;
    } else if (action === 'update-crediti') {
      confirmMessage = `Sei sicuro di voler aggiornare i crediti per l'azienda con wallet ${walletAddress} a ${crediti}?`;
    } else if (action === 'delete') {
      confirmMessage = `Sei sicuro di voler eliminare la richiesta dell'azienda con wallet ${walletAddress}? Questa azione è irreversibile.`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    
    try {
      // SEMPRE prima la transazione on-chain per activate/deactivate
      if (action === 'activate' || action === 'deactivate') {
        const transaction = prepareContractCall({
          contract,
          method: "function abilitaAzienda(address _azienda, bool _abilita)",
          params: [walletAddress, action === 'activate'],
        });
        
        await sendTransaction(transaction);
        
        // Wait for transaction to be mined
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      // POI le operazioni Firebase
      const response = await fetch('/api/update-company-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          action: action === 'update-crediti' ? 'update-crediti' : action,
          crediti: crediti,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        loadCompanies(); // Reload companies after action
        setEditingCrediti(null); // Exit editing mode
        setNewCrediti('');
      } else {
        setMessage(data.error || `Errore durante l'azione: ${action}`);
        setIsSuccess(false);
      }
    } catch (error) {
      console.error(`Error during ${action} company:`, error);
      setMessage(`Si è verificato un errore durante l'azione: ${action}. ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditingCrediti = (company: Company) => {
    setEditingCrediti(company.id);
    setNewCrediti(company.crediti?.toString() || '0');
  };

  // Filter functions
  const filterPendingCompanies = (companies: Company[]) => {
    if (!pendingSearchTerm) return companies;
    return companies.filter(company => 
      company.nome?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      company.settore?.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
      company.walletAddress?.toLowerCase().includes(pendingSearchTerm.toLowerCase())
    );
  };

  const filterActiveCompanies = (companies: Company[]) => {
    if (!activeSearchTerm) return companies;
    return companies.filter(company => 
      company.nome?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      company.settore?.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
      company.walletAddress?.toLowerCase().includes(activeSearchTerm.toLowerCase())
    );
  };

  const cancelEditingCrediti = () => {
    setEditingCrediti(null);
    setNewCrediti('');
  };

  const startEditingCompany = (company: Company) => {
    setEditingCompany(company.id);
    setEditingNome(company.nome);
    setEditingEmail(company.email);
  };

  const cancelEditingCompany = () => {
    setEditingCompany(null);
    setEditingNome('');
    setEditingEmail('');
  };

  const saveCompanyInfo = async (walletAddress: string) => {
    if (!editingNome.trim() || !editingEmail.trim()) {
      setMessage('Nome ed email sono obbligatori');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/update-company-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          nome: editingNome.trim(),
          email: editingEmail.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setIsSuccess(true);
        loadCompanies();
        setEditingCompany(null);
        setEditingNome('');
        setEditingEmail('');
      } else {
        setMessage(data.error || 'Errore durante l\'aggiornamento');
        setIsSuccess(false);
      }
    } catch (error) {
      console.error('Error updating company info:', error);
      setMessage('Errore di rete durante l\'aggiornamento');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCrediti = (walletAddress: string) => {
    const crediti = parseInt(newCrediti);
    if (isNaN(crediti) || crediti < 0) {
      setMessage('Inserisci un numero valido di crediti');
      setIsSuccess(false);
      return;
    }
    handleCompanyAction(walletAddress, 'update-crediti', crediti);
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    
    let d: Date;
    if (typeof date === 'string') {
      d = new Date(date);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return 'N/A';
    }
    
    // Check if the date is valid
    if (isNaN(d.getTime())) {
      return 'N/A';
    }
    
    return d.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!account) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-slate-500" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
            Accesso Negato
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Devi connetterti per accedere a questa pagina.
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
    );
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-red-600 mb-4">
            Accesso Negato
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Solo l'owner del contratto può accedere a questa pagina.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-primary hover:bg-primary-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Ritorna alla Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
            Pannello Amministratore
          </h1>
          <p className="text-xl text-slate-600 mb-6">
            Gestisci le aziende e il contratto SimplyChain
          </p>
          
          {/* Refresh Button */}
          <button
            onClick={loadCompanies}
            disabled={loadingCompanies}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-slate-600 hover:bg-slate-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${loadingCompanies ? 'animate-spin' : ''}`} />
            {loadingCompanies ? 'Aggiornamento...' : 'Aggiorna Lista'}
          </button>
        </div>

        {/* Change Owner Section - Moved to top */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <User className="h-6 w-6 text-primary mr-3" />
            Cambia Owner del Contratto
          </h2>
          <p className="text-slate-600 mb-4">Inserisci il nuovo indirizzo del wallet che sarà il proprietario del contratto.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newOwner}
              onChange={(e) => setNewOwner(e.target.value)}
              placeholder="Nuovo indirizzo owner (0x...)"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={handleChangeOwner}
              disabled={isLoading || !newOwner}
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-700 disabled:opacity-50 transition-all duration-200 shadow-md"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              Conferma Cambio Owner
            </button>
          </div>
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center ${isSuccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isSuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
              {message}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">In Attesa</p>
                <p className="text-3xl font-bold">{companies.pending.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Attive</p>
                <p className="text-3xl font-bold">{companies.active.length}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Totale</p>
                <p className="text-3xl font-bold">{companies.pending.length + companies.active.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Controlli di Visualizzazione</h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPending}
                onChange={(e) => setShowPending(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-slate-700">Mostra Richieste in Attesa</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showActive}
                onChange={(e) => setShowActive(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-slate-700">Mostra Aziende Attive</span>
            </label>
          </div>
        </div>

        {/* Pending Companies */}
        {showPending && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <Clock className="h-6 w-6 text-orange-500 mr-3" />
                Richieste in Attesa ({filterPendingCompanies(companies.pending).length})
              </h2>
              <div className="text-sm text-slate-500">
                Ultime richieste per prime
              </div>
            </div>

            {/* Pending Search Filter */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={pendingSearchTerm}
                  onChange={(e) => setPendingSearchTerm(e.target.value)}
                  placeholder="Cerca per nome, email, settore o wallet..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {pendingSearchTerm && (
                  <button
                    onClick={() => setPendingSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

          {loadingCompanies ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-500" />
              <p className="text-slate-600">Caricamento aziende...</p>
            </div>
          ) : filterPendingCompanies(companies.pending).length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                {pendingSearchTerm ? 'Nessuna richiesta trovata per la ricerca' : 'Nessuna richiesta in attesa'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filterPendingCompanies(companies.pending).map((company) => (
                <div key={company.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{company.nome}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-slate-400" />
                          {company.email}
                        </div>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-slate-400" />
                          {company.settore}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="font-mono text-xs">{company.walletAddress}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-slate-400" />
                          {formatDate(company.createdAt)}
                        </div>
                      </div>
                      
                      {/* Social Links */}
                      {(company.sitoWeb || company.linkedin || company.facebook || company.instagram || company.twitter || company.tiktok) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {company.sitoWeb && (
                            <a href={company.sitoWeb} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                              <Globe className="h-3 w-3 mr-1" />
                              Sito Web
                            </a>
                          )}
                          {company.linkedin && (
                            <a href={company.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                              <Linkedin className="h-3 w-3 mr-1" />
                              LinkedIn
                            </a>
                          )}
                          {company.facebook && (
                            <a href={company.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                              <Facebook className="h-3 w-3 mr-1" />
                              Facebook
                            </a>
                          )}
                          {company.instagram && (
                            <a href={company.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors">
                              <Instagram className="h-3 w-3 mr-1" />
                              Instagram
                            </a>
                          )}
                          {company.twitter && (
                            <a href={company.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-sky-100 text-sky-700 hover:bg-sky-200 transition-colors">
                              <Twitter className="h-3 w-3 mr-1" />
                              Twitter
                            </a>
                          )}
                          {company.tiktok && (
                            <a href={company.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-black text-white hover:bg-gray-800 transition-colors">
                              <Music className="h-3 w-3 mr-1" />
                              TikTok
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleCompanyAction(company.walletAddress, 'activate', 0)}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Attiva
                      </button>
                      <button
                        onClick={() => handleCompanyAction(company.walletAddress, 'delete')}
                        disabled={isLoading}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Elimina
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}

        {/* Active Companies */}
        {showActive && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="h-6 w-6 text-green-500 mr-3" />
                Aziende Attive ({filterActiveCompanies(companies.active).length})
              </h2>
            </div>

            {/* Active Search Filter */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={activeSearchTerm}
                  onChange={(e) => setActiveSearchTerm(e.target.value)}
                  placeholder="Cerca per nome, email, settore o wallet..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {activeSearchTerm && (
                  <button
                    onClick={() => setActiveSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

          {filterActiveCompanies(companies.active).length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">
                {activeSearchTerm ? 'Nessuna azienda trovata per la ricerca' : 'Nessuna azienda attiva'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filterActiveCompanies(companies.active).map((company) => (
                <div key={company.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {editingCompany === company.id ? (
                          <div className="flex-1 mr-3">
                            <input
                              type="text"
                              value={editingNome}
                              onChange={(e) => setEditingNome(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="Nome azienda"
                            />
                          </div>
                        ) : (
                          <h3 className="text-xl font-bold text-slate-900 mr-3">{company.nome}</h3>
                        )}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Attiva
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-slate-400" />
                          {editingCompany === company.id ? (
                            <input
                              type="email"
                              value={editingEmail}
                              onChange={(e) => setEditingEmail(e.target.value)}
                              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="Email azienda"
                            />
                          ) : (
                            company.email
                          )}
                        </div>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-slate-400" />
                          {company.settore}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="font-mono text-xs">{company.walletAddress}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-slate-400" />
                          Attivata: {formatDate(company.activatedAt)}
                        </div>
                      </div>

                      {/* Crediti Section */}
                      <div className="bg-slate-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 text-slate-500 mr-2" />
                            <span className="font-semibold text-slate-700">Crediti:</span>
                            {editingCrediti === company.id ? (
                              <div className="flex items-center ml-3">
                                <input
                                  type="number"
                                  value={newCrediti}
                                  onChange={(e) => setNewCrediti(e.target.value)}
                                  className="w-20 px-2 py-1 border border-slate-300 rounded text-sm mr-2"
                                  min="0"
                                />
                                <button
                                  onClick={() => saveCrediti(company.walletAddress)}
                                  className="text-green-600 hover:text-green-700 mr-2"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={cancelEditingCrediti}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center ml-3">
                                <span className="text-2xl font-bold text-primary">{company.crediti || 0}</span>
                                <button
                                  onClick={() => startEditingCrediti(company)}
                                  className="ml-2 text-slate-500 hover:text-slate-700"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {editingCompany === company.id ? (
                        <>
                          <button
                            onClick={() => saveCompanyInfo(company.walletAddress)}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Salva
                          </button>
                          <button
                            onClick={cancelEditingCompany}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Annulla
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditingCompany(company)}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Modifica
                          </button>
                          <button
                            onClick={() => handleCompanyAction(company.walletAddress, 'deactivate')}
                            disabled={isLoading}
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 shadow-lg transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Disattiva
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg flex items-center ${
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

        {/* Back to Dashboard */}
        <div className="text-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-slate-300 text-base font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Torna alla Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SfyAdmin;