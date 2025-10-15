import React, { useState, useEffect } from 'react';
import { useAuth } from '../src/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../src/firebase';
import { CheckCircle, AlertCircle, Loader2, ArrowLeft, User, Building, Mail, Globe, Linkedin, Facebook, Instagram, Twitter, Music, RefreshCw, Shield, ShieldCheck, CreditCard, Users, Clock, CheckCircle2, XCircle, Edit3, Search } from 'lucide-react';

interface Company {
  id: string;
  email: string;
  nome: string;
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
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
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
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate('/login');
        return;
      }
      loadCompanies();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const companiesRef = collection(db, 'companies');
      const snapshot = await getDocs(companiesRef);
      
      const companiesData: Company[] = [];
      snapshot.forEach((doc) => {
        companiesData.push({ id: doc.id, ...doc.data() } as Company);
      });

      const pending = companiesData.filter(company => company.pending && !company.isActive);
      const active = companiesData.filter(company => company.isActive);

      setCompanies({ pending, active });
    } catch (error) {
      console.error('Error loading companies:', error);
      setMessage('Errore nel caricamento delle aziende');
      setIsSuccess(false);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const activateCompany = async (companyId: string) => {
    try {
      const companyRef = doc(db, 'companies', companyId);
      await updateDoc(companyRef, {
        isActive: true,
        pending: false,
        activatedAt: new Date()
      });
      
      setMessage('Azienda attivata con successo');
      setIsSuccess(true);
      loadCompanies();
    } catch (error) {
      console.error('Error activating company:', error);
      setMessage('Errore nell\'attivazione dell\'azienda');
      setIsSuccess(false);
    }
  };

  const deactivateCompany = async (companyId: string) => {
    try {
      const companyRef = doc(db, 'companies', companyId);
      await updateDoc(companyRef, {
        isActive: false,
        pending: true
      });
      
      setMessage('Azienda disattivata con successo');
      setIsSuccess(true);
      loadCompanies();
    } catch (error) {
      console.error('Error deactivating company:', error);
      setMessage('Errore nella disattivazione dell\'azienda');
      setIsSuccess(false);
    }
  };

  const updateCrediti = async (companyId: string) => {
    if (!newCrediti || isNaN(Number(newCrediti))) {
      setMessage('Inserisci un numero valido per i crediti');
      setIsSuccess(false);
      return;
    }

    try {
      const companyRef = doc(db, 'companies', companyId);
      await updateDoc(companyRef, {
        crediti: Number(newCrediti)
      });
      
      setMessage('Crediti aggiornati con successo');
      setIsSuccess(true);
      setEditingCrediti(null);
      setNewCrediti('');
      loadCompanies();
    } catch (error) {
      console.error('Error updating crediti:', error);
      setMessage('Errore nell\'aggiornamento dei crediti');
      setIsSuccess(false);
    }
  };

  const updateCompanyInfo = async (companyId: string) => {
    if (!editingNome || !editingEmail) {
      setMessage('Inserisci nome ed email validi');
      setIsSuccess(false);
      return;
    }

    try {
      const companyRef = doc(db, 'companies', companyId);
      await updateDoc(companyRef, {
        nome: editingNome,
        email: editingEmail
      });
      
      setMessage('Informazioni azienda aggiornate con successo');
      setIsSuccess(true);
      setEditingCompany(null);
      setEditingNome('');
      setEditingEmail('');
      loadCompanies();
    } catch (error) {
      console.error('Error updating company info:', error);
      setMessage('Errore nell\'aggiornamento delle informazioni');
      setIsSuccess(false);
    }
  };

  const filteredPending = companies.pending.filter(company =>
    company.nome.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(pendingSearchTerm.toLowerCase())
  );

  const filteredActive = companies.active.filter(company =>
    company.nome.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(activeSearchTerm.toLowerCase())
  );

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

  if (!user || !isAdmin) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Gestisci le aziende e le richieste di attivazione</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla Home
            </button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Companies */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                  Richieste in Attesa ({filteredPending.length})
                </h2>
                <button
                  onClick={() => setShowPending(!showPending)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPending ? 'Nascondi' : 'Mostra'}
                </button>
              </div>
              
              {showPending && (
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cerca aziende..."
                      value={pendingSearchTerm}
                      onChange={(e) => setPendingSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {showPending && (
              <div className="p-6">
                {loadingCompanies ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Caricamento...</p>
                  </div>
                ) : filteredPending.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nessuna richiesta in attesa</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredPending.map((company) => (
                      <div key={company.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{company.nome}</h3>
                            <p className="text-sm text-gray-600">{company.email}</p>
                            <p className="text-sm text-gray-500">{company.settore}</p>
                            {company.createdAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                Richiesta: {new Date(company.createdAt).toLocaleDateString('it-IT')}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => activateCompany(company.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                            >
                              Attiva
                            </button>
                            <button
                              onClick={() => deactivateCompany(company.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Rifiuta
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Companies */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Aziende Attive ({filteredActive.length})
                </h2>
                <button
                  onClick={() => setShowActive(!showActive)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showActive ? 'Nascondi' : 'Mostra'}
                </button>
              </div>
              
              {showActive && (
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cerca aziende..."
                      value={activeSearchTerm}
                      onChange={(e) => setActiveSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {showActive && (
              <div className="p-6">
                {loadingCompanies ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Caricamento...</p>
                  </div>
                ) : filteredActive.length === 0 ? (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nessuna azienda attiva</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredActive.map((company) => (
                      <div key={company.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{company.nome}</h3>
                            <p className="text-sm text-gray-600">{company.email}</p>
                            <p className="text-sm text-gray-500">{company.settore}</p>
                            <p className="text-sm text-blue-600">
                              Crediti: {company.crediti || 0}
                            </p>
                            {company.activatedAt && (
                              <p className="text-xs text-gray-400 mt-1">
                                Attivata: {new Date(company.activatedAt).toLocaleDateString('it-IT')}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingCompany(company.id);
                                setEditingNome(company.nome);
                                setEditingEmail(company.email);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                            >
                              Modifica
                            </button>
                            <button
                              onClick={() => deactivateCompany(company.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Disattiva
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Company Modal */}
        {editingCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifica Azienda</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={editingNome}
                    onChange={(e) => setEditingNome(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingEmail}
                    onChange={(e) => setEditingEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setEditingCompany(null);
                    setEditingNome('');
                    setEditingEmail('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Annulla
                </button>
                <button
                  onClick={() => updateCompanyInfo(editingCompany)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Crediti Modal */}
        {editingCrediti && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Modifica Crediti</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nuovo numero di crediti</label>
                <input
                  type="number"
                  value={newCrediti}
                  onChange={(e) => setNewCrediti(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Inserisci il numero di crediti"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setEditingCrediti(null);
                    setNewCrediti('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Annulla
                </button>
                <button
                  onClick={() => updateCrediti(editingCrediti)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Salva
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SfyAdmin;