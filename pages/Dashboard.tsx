import React, { useState, useEffect } from 'react';
import { useActiveAccount, useReadContract } from 'thirdweb/react';
import { getContract } from 'thirdweb/contract';
import { readContract } from 'thirdweb';
import { createThirdwebClient } from 'thirdweb';
import { arbitrum } from 'thirdweb/chains';
import { CheckCircle, Building, CreditCard, Calendar, Plus, Loader2, AlertCircle, Hash, FileText, MapPin, ExternalLink, X, Copy, FileUp } from 'lucide-react';
import { useActiveAccount, useSendTransaction } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { getContract } from 'thirdweb/contract';
import { prepareContractCall } from 'thirdweb';
import { arbitrum } from 'thirdweb/chains';
import { readContract } from 'thirdweb';
import { Link } from 'react-router-dom';
import BatchCreationModal from '../components/BatchCreationModal';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

interface CompanyInfo {
  nome: string;
  email: string;
  settore: string;
  crediti: number;
}

const Dashboard: React.FC = () => {
  const account = useActiveAccount();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [iscrizioni, setIscrizioni] = useState<any[]>([]);
  const [iscrizioniLoading, setIscrizioniLoading] = useState(false);
  const [stepsModal, setStepsModal] = useState<{open: boolean; steps: any[]}>({ open: false, steps: [] });
  const [hashModal, setHashModal] = useState<{open: boolean; hash: string}>({ open: false, hash: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [lastSource, setLastSource] = useState<'cache' | 'sdk+firebase'>('cache');
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
  const [lastIscrizioniRefresh, setLastIscrizioniRefresh] = useState<number>(0);
  const [lastNotarizzazioniRefresh, setLastNotarizzazioniRefresh] = useState<number>(0);
  const [paymentChecking, setPaymentChecking] = useState<boolean>(false);

  // Cache system
  const CACHE_KEY = 'iscrizioni_cache';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ore
  const NOTA_CACHE_KEY = 'notarizzazioni_cache';

  const getCachedIscrizioni = (wallet: string) => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${wallet}`);
      if (!cached) return null;
      
      const { data, timestamp, lastTxHash } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      return isExpired ? null : { data, lastTxHash };
    } catch (e) {
      return null;
    }
  };

  const setCachedIscrizioni = (wallet: string, data: any[], lastTxHash?: string) => {
    try {
      localStorage.setItem(`${CACHE_KEY}_${wallet}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        lastTxHash: lastTxHash || ''
      }));
    } catch (e) {
      console.warn('Failed to cache iscrizioni:', e);
    }
  };

  const getCachedNotarizzazioni = (wallet: string) => {
    try {
      const cached = localStorage.getItem(`${NOTA_CACHE_KEY}_${wallet}`);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      return isExpired ? null : data;
    } catch { return null; }
  };
  const setCachedNotarizzazioni = (wallet: string, data: any[]) => {
    try {
      localStorage.setItem(`${NOTA_CACHE_KEY}_${wallet}`, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {}
  };

  const client = createThirdwebClient({ clientId: (import.meta as any).env?.VITE_THIRDWEB_CLIENT_ID || '' });
  const contract = getContract({ client, chain: arbitrum, address: '0x71efb9364a896973b80786541c3a431bcf6c7efa' });

  const { data: isAbilitata } = useReadContract({
    contract,
    method: 'function aziendeAbilitate(address) view returns (bool)',
    params: [account?.address || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: Boolean(account?.address),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: 0,
      retry: 1,
      staleTime: Infinity,
    },
  });

  const { data: batchesIds } = useReadContract({
    contract,
    method: 'function getBatchesAzienda(address _azienda) view returns (uint256[])',
    params: [account?.address || '0x0000000000000000000000000000000000000000'],
    query: {
      enabled: Boolean(account?.address),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: 0,
      retry: 1,
      staleTime: Infinity,
    },
  });
  const { data: getInfoBatch } = { data: null } as any; // placeholder to avoid TS complaints in this context

  const formatDateItalian = (dateString: string) => {
    if (!dateString) return '';
    // If already in dd/mm/yyyy, return as is
    if (dateString.includes('/')) return dateString;
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const [yyyy, mm, dd] = parts;
    return `${dd}/${mm}/${yyyy}`;
  };

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!account?.address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check if company is enabled on-chain
        if (isAbilitata === false) {
          setError('La tua azienda non è attiva. Contatta l\'amministratore.');
          setLoading(false);
          return;
        }

        // Fetch company info from Firebase
        const response = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
        if (response.ok) {
          const data = await response.json();
          if (data.isActive && data.company) {
            setCompanyInfo({
              nome: data.company.nome || 'N/A',
              email: data.company.email || 'N/A',
              settore: data.company.settore || 'N/A',
              crediti: data.company.crediti || 0,
            });
          } else {
            setError('Informazioni azienda non trovate.');
          }
        } else {
          setError('Errore nel caricamento delle informazioni azienda.');
        }
      } catch (err) {
        console.error('Error fetching company info:', err);
        setError('Errore di rete nel caricamento delle informazioni.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [account?.address, isAbilitata]);

  // If redirected from Stripe success, poll credits for a short period to reflect webhook update
  useEffect(() => {
    if (!account?.address) return;
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');
    if (paymentStatus !== 'success') return;
    // Start polling credits for up to 60s
    setPaymentChecking(true);
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 20; // ~60s at 3s interval
    const intervalMs = 3000;
    // We'll try to confirm on every attempt until paid
    const poll = async () => {
      attempts += 1;
      try {
        if (sessionId) {
          try {
            const c = await fetch(`/api/stripe?action=confirm-session&session_id=${encodeURIComponent(sessionId)}`);
            const cj = await c.json().catch(() => ({}));
            if (c.ok && cj?.ok) {
              // After server-side confirmation, fetch credits and stop
              const r2 = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
              if (r2.ok) {
                const d2 = await r2.json();
                if (d2?.company) {
                  setCompanyInfo({
                    nome: d2.company.nome || 'N/A',
                    email: d2.company.email || 'N/A',
                    settore: d2.company.settore || 'N/A',
                    crediti: d2.company.crediti || 0,
                  });
                }
              }
              setPaymentChecking(false);
              const url = new URL(window.location.href);
              url.searchParams.delete('payment');
              url.searchParams.delete('session_id');
              window.history.replaceState({}, '', url.toString());
              return;
            }
          } catch {}
        }
        const r = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
        if (r.ok) {
          const data = await r.json();
          if (data?.company) {
            setCompanyInfo({
              nome: data.company.nome || 'N/A',
              email: data.company.email || 'N/A',
              settore: data.company.settore || 'N/A',
              crediti: data.company.crediti || 0,
            });
            // Heuristic: stop polling once attempts exhausted
            if (attempts >= maxAttempts) {
              setPaymentChecking(false);
              // Clean URL to remove query params
              const url = new URL(window.location.href);
              url.searchParams.delete('payment');
              url.searchParams.delete('session_id');
              window.history.replaceState({}, '', url.toString());
              return;
            }
          }
        }
      } catch {}
      if (!cancelled && attempts < maxAttempts) {
        setTimeout(poll, intervalMs);
      } else {
        setPaymentChecking(false);
        // Clean URL anyway
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('payment');
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.toString());
        } catch {}
      }
    };
    setTimeout(poll, 500);
    return () => { cancelled = true; };
  }, [account?.address]);

  // Redirect directly to registration form if company info not found
  useEffect(() => {
    if (error && String(error).toLowerCase().includes('informazioni azienda non trovate')) {
      window.location.replace('/form');
    }
  }, [error]);

  // Update credits locally when a credit change event is dispatched (no extra server calls here)
  useEffect(() => {
    const onCredits = (e: any) => {
      const newCredits = Number(e?.detail?.crediti);
      if (!Number.isNaN(newCredits)) {
        setCompanyInfo((prev) => prev ? { ...prev, crediti: newCredits } : prev);
      }
    };
    window.addEventListener('companyCreditsUpdated', onCredits as any);
    return () => window.removeEventListener('companyCreditsUpdated', onCredits as any);
  }, []);

  // Hybrid loading system: Cache + SDK + Firebase TXHASH
  const loadIscrizioni = async (wallet: string, forceRefresh = false) => {
    setIscrizioniLoading(true);
    try {
      // 1. Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = getCachedIscrizioni(wallet);
        if (cached) {
          console.log('📦 Loading from cache');
          let dataFromCache = cached.data;
          // Enrich cached items with txHash from Firebase (if missing)
          try {
            const txResp = await fetch(`/api/get-txhash?wallet=${wallet}`);
            if (txResp.ok) {
              const txJson = await txResp.json();
              const map: Record<string, string> = (txJson.txHashes || []).reduce((acc: Record<string, string>, tx: any) => {
                if (tx.batchId && tx.txHash) acc[String(tx.batchId)] = String(tx.txHash);
                return acc;
              }, {});
              dataFromCache = dataFromCache.map((it: any) => ({
                ...it,
                txHash: it.txHash || map[String(it.batchId)] || undefined,
              }));
            }
          } catch {}
          setIscrizioni(dataFromCache);
          setLastSource('cache');
          setCurrentPage(1);
          return { source: 'cache', data: dataFromCache };
        }
      }

      // 2. Load IDs: use fresh on-chain read if forceRefresh, otherwise use hook snapshot
      console.log('⛓️ Loading from SDK (RPC calls)');
      let idsToUse: any[] | null = null;
      
      if (forceRefresh && account?.address) {
        try {
          // Load only normal batches (production phases)
          const freshIds: any = await readContract({
            contract,
            method: 'function getBatchesAzienda(address _azienda) view returns (uint256[])',
            params: [account.address],
          });
          idsToUse = Array.isArray(freshIds) ? freshIds : [];
        } catch (e) {
          console.warn('Failed to fetch fresh batch IDs:', e);
          idsToUse = Array.isArray(batchesIds) ? batchesIds as any[] : [];
        }
      } else {
        idsToUse = Array.isArray(batchesIds) ? batchesIds as any[] : [];
      }
      if (!Array.isArray(idsToUse)) idsToUse = [];

      // 3. Load txHashes from Firebase (fast database call)
      console.log('🔥 Loading txHashes from Firebase');
      let txHashesMap: Record<string, string> = {};
      try {
        const txResponse = await fetch(`/api/get-txhash?wallet=${wallet}`);
        if (txResponse.ok) {
          const txData = await txResponse.json();
          txHashesMap = txData.txHashes.reduce((acc: Record<string, string>, tx: any) => {
            acc[tx.batchId] = tx.txHash;
            return acc;
          }, {});
          console.log('🔥 Loaded', Object.keys(txHashesMap).length, 'txHashes from Firebase');
        }
      } catch (e) {
        console.warn('Failed to load txHashes from Firebase:', e);
      }

      const results: any[] = [];
      for (const id of idsToUse) {
        try {
          const info: any = await readContract({
            contract,
            method: 'function getInfoBatch(uint256) view returns (uint256,address,string,string,string,string,string,(string,string,string,string,string)[])',
            params: [BigInt(id)],
          });
          const decoded = info as any[];
          const stepsArr = (decoded?.[7] || []) as any[];
          const batchId = String(decoded?.[0] ?? id);
          
          const nomeVal = decoded?.[2] || '';
          results.push({
            id: batchId,
            batchId: batchId,
            nome: nomeVal,
            descrizione: decoded?.[3] || '',
            data: decoded?.[4] || '',
            luogo: decoded?.[5] || '',
            hashDocumento: decoded?.[6] || '',
            txHash: txHashesMap[batchId] || undefined, // Join con Firebase
            steps: Array.isArray(stepsArr)
              ? stepsArr.map((s: any[]) => ({
                  nome: s?.[0] || '',
                  descrizione: s?.[1] || '',
                  data: s?.[2] || '',
                  luogo: s?.[3] || '',
                  hashDocumento: s?.[4] || '',
                }))
              : [],
          });
        } catch (e) {
          console.error('Errore lettura batch', id, e);
        }
      }
      
      // Note: Notarization batches are handled separately in loadNotarizzazioni()
      // They should not appear in the production phases (iscrizioni) list
      
      // Sort results by batch ID (newest first)
      results.sort((a, b) => Number(b.batchId) - Number(a.batchId));
      
      // Cache the results
      setCachedIscrizioni(wallet, results);
      setIscrizioni(results);
      setLastSource('sdk+firebase');
      setCurrentPage(1);
      return { source: 'sdk+firebase', data: results };
    } catch (e) {
      console.error('Load iscrizioni error', e);
      setError('Errore nel caricamento delle iscrizioni');
      return { source: 'error', data: [] };
    } finally {
      setIscrizioniLoading(false);
    }
  };

  useEffect(() => {
    if (!account?.address || mode !== 'iscrizioni') return;
    loadIscrizioni(account.address, false);
  }, [mode, account?.address, Array.isArray(batchesIds) ? batchesIds.map(String).join(',') : '']);

  // Notarizzazioni: carica elenco dal DB
  const loadNotarizzazioni = async (forceRefresh = false) => {
    if (!account?.address) return;
    setNotarizzazioniLoading(true);
    try {
      if (!forceRefresh) {
        const cached = getCachedNotarizzazioni(account.address);
        if (cached) {
          setNotarizzazioni(cached);
          setNotarizzaPage(1);
          return;
        }
      }
      
      // 1) Load notarization batch IDs from contract
      const notarizationIds: any = await readContract({
        contract,
        method: 'function getNotarizationBatchesAzienda(address _azienda) view returns (uint256[])',
        params: [account.address],
      });
      
      // 2) Load notarization txHashes from Firebase (separate from production phases)
      let txHashesMap: Record<string, string> = {};
      try {
        const txResponse = await fetch(`/api/get-notarization-txhash?wallet=${account.address}`);
        console.log('🔥 API Response status:', txResponse.status);
        if (txResponse.ok) {
          const txData = await txResponse.json();
          console.log('🔥 Notarization txHashes:', txData.txHashes);
          console.log('🔥 Number of txHashes found:', txData.txHashes?.length || 0);
          txHashesMap = txData.txHashes.reduce((acc: Record<string, string>, tx: any) => {
            // Usa l'hash del documento come chiave principale, fallback al batchId
            const key = tx.hash || tx.batchId;
            if (key) {
              acc[key] = tx.txHash;
              console.log('🔥 Mapped key:', key, '→ txHash:', tx.txHash);
            }
            return acc;
          }, {});
          console.log('🔥 Notarization txHashesMap:', txHashesMap);
          console.log('🔥 txHashesMap keys:', Object.keys(txHashesMap));
        } else {
          console.error('🔥 API Error:', txResponse.status, await txResponse.text());
        }
      } catch (e) {
        console.warn('Failed to load notarization txHashes from Firebase:', e);
      }
      
      // 3) Load each notarization batch details
      const out: any[] = [];
      for (const id of (Array.isArray(notarizationIds) ? notarizationIds : [])) {
        try {
          const info: any = await readContract({
            contract,
            method: 'function getNotarizationBatch(uint256) view returns (uint256,address,string,string)',
            params: [BigInt(id)],
          });
          const decoded = info as any[];
          const batchId = String(decoded?.[0] ?? id);
          
          // Cerca il txHash usando l'hash del documento come chiave
          const documentHash = decoded?.[3] || '';
          const txHash = txHashesMap[documentHash] || txHashesMap[batchId] || undefined;
          
          console.log('📄 Notarization batch:', {
            id,
            batchId,
            nome: decoded?.[2],
            hash: documentHash,
            txHash,
            txHashesMapKeys: Object.keys(txHashesMap)
          });
          
          out.push({
            batchId,
            nome: decoded?.[2] || '(Documento Notarizzato)',
            hash: documentHash,
            txHash: txHash,
            createdAt: null,
          });
        } catch (e) {
          console.error('Errore lettura notarization batch', id, e);
        }
      }
      
      out.sort((a, b) => Number(b.batchId) - Number(a.batchId));
      setNotarizzazioni(out);
      setCachedNotarizzazioni(account.address, out);
    } catch (e) {
      console.error('Load notarizzazioni error', e);
    } finally {
      setNotarizzazioniLoading(false);
    }
  };
  useEffect(() => {
    if (mode === 'notarizza') loadNotarizzazioni();
  }, [mode, account?.address]);

  // Listen for iscrizione completion to refresh only iscrizioni list
  useEffect(() => {
    const handler = () => {
      if (account?.address) {
        setLastIscrizioniRefresh(Date.now());
        loadIscrizioni(account.address, true);
      }
    };
    window.addEventListener('iscrizioneCompleted', handler as any);
    return () => window.removeEventListener('iscrizioneCompleted', handler as any);
  }, [account?.address]);

  // Listen for notarization completion from NotarizzaForm and refresh only that list
  useEffect(() => {
    const handler = () => {
      setLastNotarizzazioniRefresh(Date.now());
      loadNotarizzazioni(true);
    };
    window.addEventListener('notarizzazioneCompleted', handler as any);
    return () => window.removeEventListener('notarizzazioneCompleted', handler as any);
  }, [account?.address]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Caricamento...</h2>
          <p className="text-lg text-slate-600">Stiamo verificando lo stato della tua azienda.</p>
        </div>
      </div>
    );
  }

  if (error) {
    // If it's the specific missing company info case, the effect above will redirect.
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Company Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center mb-4">
            <Building className="h-8 w-8 text-primary mr-3" />
            <h3 className="text-lg font-semibold text-slate-900">Nome Azienda</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{companyInfo?.nome || 'N/A'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 relative">
          <div className="flex items-center mb-4">
            <CreditCard className="h-8 w-8 text-primary mr-3" />
            <h3 className="text-lg font-semibold text-slate-900">Crediti Rimanenti</h3>
          </div>
          <p className="text-2xl font-bold text-primary">{companyInfo?.crediti || 0}</p>
          <Link to="/ricaricacrediti" className="absolute bottom-3 right-4 text-primary text-sm hover:underline">Ricarica</Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-8 w-8 text-primary mr-3" />
            <h3 className="text-lg font-semibold text-slate-900">Settore</h3>
          </div>
          <p className="text-2xl font-bold text-slate-800">{companyInfo?.settore || 'N/A'}</p>
        </div>
      </div>

      {/* Always-visible banner with actions inside */}
      <div className="mt-6 mx-auto max-w-4xl w-full">
        <div className="rounded-2xl shadow-sm p-6 bg-primary/10 border border-primary/20">
          <div className="grid sm:grid-cols-2 gap-6 place-content-center">
            <div className="bg-white rounded-xl p-5 border border-primary/10 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Certifica Fasi Produttive</h3>
                <p className="text-slate-700 text-sm">Traccia e certifica ogni fase della filiera in blockchain, garantendo trasparenza e autenticità.</p>
              </div>
              <button
                onClick={() => { setMode('iscrizioni'); }}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-primary/30 text-primary bg-primary/5 text-sm font-semibold rounded-lg hover:bg-primary/10 shadow"
              >
                <span className="material-symbols-outlined text-[18px] mr-2">add_circle</span>
                Certifica Fasi Produttive
              </button>
            </div>
            <div className="bg-white rounded-xl p-5 border border-primary/10 flex flex-col h-full">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Certifica Documenti</h3>
                <p className="text-slate-700 text-sm">Proteggi i tuoi file registrando l’hash SHA-256 su blockchain: prova certa e immutabile della loro esistenza.</p>
              </div>
              <button
                onClick={() => setMode('notarizza')}
                className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-primary/30 text-primary bg-primary/5 text-sm font-semibold rounded-lg hover:bg-primary/10 shadow"
              >
                <FileUp className="h-4 w-4 mr-2" /> Certifica Documenti
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mode toggle + Content */}
      <div className="mt-12">
        {mode === null ? (
          <></>
        ) : mode === 'iscrizioni' ? (
          <>
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Fasi Produttive Certificate</h2>
              <p className="text-slate-600 mt-2">Registra ogni fase produttiva sulla blockchain e genera un QR code univoco da applicare ai tuoi prodotti, garantendo trasparenza e tracciabilità.</p>
            </div>

            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowBatchModal(true)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm bg-primary text-white hover:bg-primary-700 shadow"
                  aria-label="Nuova Iscrizione"
                >
                  <span className="material-symbols-outlined text-[18px] mr-2">add</span>
                  Nuova Iscrizione
                </button>
                {!iscrizioniLoading && iscrizioni.length > 0 && (
                  <button 
                    onClick={() => { if (Date.now() - lastIscrizioniRefresh > 60000) { setLastIscrizioniRefresh(Date.now()); loadIscrizioni(account?.address || '', true); } }}
                    disabled={iscrizioniLoading || Date.now() - lastIscrizioniRefresh <= 60000}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm border bg-white text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary mr-2">autorenew</span>
                    {iscrizioniLoading ? 'Caricamento...' : 'Aggiorna'}
                  </button>
                )}
              </div>
              {!iscrizioniLoading && iscrizioni.length > 0 && (
                <div className="w-full sm:w-auto">
                  <input
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="Cerca per nome"
                    className="w-full sm:w-80 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Documenti Certificati</h2>
              <div className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p>Carica un documento di qualsiasi tipo (immagine, PDF, foglio CSV, contratto, ecc.). Il sistema calcolerà automaticamente la sua impronta digitale unica (SHA256 Hash).</p>
                <p className="mt-2">Questo hash verrà registrato in modo permanente sulla blockchain, creando una prova immutabile dell'esistenza del documento a una data e un'ora specifiche. Se il file viene modificato anche di un solo byte, il suo hash cambierà, rendendo immediatamente evidente qualsiasi alterazione.</p>
                <p className="mt-2">Questo processo non salva il file sulla blockchain, ma solo la sua impronta digitale. In questo modo la tua privacy rimane protetta, mentre la prova crittografica della sua esistenza resta pubblica e verificabile per sempre.</p>
              </div>
            </div>
            <NotarizzaForm />
            {notarizzazioniLoading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            ) : (
            <div className="flex flex-col gap-3 mt-10 mb-4 sm:flex-row sm:items-center sm:justify-between">
              {notarizzazioni.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { if (Date.now() - lastNotarizzazioniRefresh > 60000) { setLastNotarizzazioniRefresh(Date.now()); loadNotarizzazioni(true); } }}
                      disabled={notarizzazioniLoading || Date.now() - lastNotarizzazioniRefresh <= 60000}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm border bg-white text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary mr-1">autorenew</span>
                      {notarizzazioniLoading ? 'Caricamento...' : 'Aggiorna'}
                    </button>
                  </div>
                  <div className="w-full sm:w-auto">
                    <input
                      value={notarizzaSearch}
                      onChange={(e) => { setNotarizzaSearch(e.target.value); setNotarizzaPage(1); }}
                      placeholder="Cerca per nome documento o hash"
                      className="w-full sm:w-80 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                </>
              )}
            </div>
            )}
          </>
        )}

        {/* Pagination Top */}
        {mode === 'iscrizioni' && !iscrizioniLoading && iscrizioni.length > 0 && (
          <Pagination
            totalItems={iscrizioni.filter(i => (i.nome && i.nome.toLowerCase().includes(searchTerm.toLowerCase())) || !searchTerm).length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}
        {mode === 'notarizza' && !notarizzazioniLoading && notarizzazioni.length > 0 && (
          <Pagination
            totalItems={notarizzazioni.filter(n => {
              const q = notarizzaSearch.toLowerCase();
              const visibleBySearch = !q || (String(n.nome || '').toLowerCase().includes(q) || String(n.hash || '').toLowerCase().includes(q));
              const hasMeaningfulName = String(n.nome || '').trim() !== '' && String(n.nome) !== '(Notarizzazione)';
              return visibleBySearch && hasMeaningfulName;
            }).length}
            pageSize={pageSize}
            currentPage={notarizzaPage}
            onPageChange={setNotarizzaPage}
          />
        )}
        {mode === 'iscrizioni' ? (
          iscrizioniLoading ? (
          <div className="py-12 flex items-center justify-center"><Loader2 className="h-12 w-12 text-primary animate-spin" /></div>
          ) : iscrizioni.length === 0 ? (
          <div className="text-slate-600">Nessuna iscrizione trovata.</div>
          ) : (
          <div className="space-y-4">
            {iscrizioni
              .filter(i => (i.nome && i.nome.toLowerCase().includes(searchTerm.toLowerCase())) || !searchTerm)
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((it) => (
              <div key={it.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary transition-all">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                  <div className="min-w-0 flex-1">
                    {it.nome && (
                      <div className="break-words">
                        <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-2xl md:text-3xl tracking-tight">
                          {it.nome}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-lg md:text-base text-slate-800">
                      {it.luogo && (
                        <div className="flex items-center"><MapPin className="h-5 w-5 md:h-4 md:w-4 mr-2 text-primary" /> <span className="font-medium">{it.luogo}</span></div>
                      )}
                      {it.data && (
                        <div className="flex items-center"><Calendar className="h-5 w-5 md:h-4 md:w-4 mr-2 text-primary" /> <span className="font-medium">{formatDateItalian(it.data)}</span></div>
                      )}
                      {Array.isArray(it.steps) && it.steps.length > 0 && (
                        <button
                          onClick={() => setStepsModal({ open: true, steps: it.steps })}
                          className="text-left text-primary hover:underline flex items-center text-lg md:text-base"
                        >
                          <span className="material-symbols-outlined text-[18px] mr-1">list_alt</span> {it.steps.length} Steps (clicca per dettagli)
                        </button>
                      )}
                      {it.descrizione && (
                        <div className="col-span-1 sm:col-span-2 text-slate-700 break-words text-base md:text-lg leading-relaxed">{it.descrizione}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[260px] md:justify-center">
                    {/* Pulsanti in colonna: 1) Verifica, 2) Documento, 3) Esporta */}
                    {it.txHash && (
                      <a
                        href={`${(((import.meta as any).env?.VITE_EXPLORER_TX_URL_TEMPLATE) || 'https://arbiscan.io/inputdatadecoder?tx={txHash}').replace('{txHash}', it.txHash)}`}
                        target="_blank" rel="noreferrer"
                        className="w-full md:w-auto inline-flex items-center justify-center px-4 py-3 md:px-3 md:py-2 rounded-lg text-white bg-primary hover:bg-primary-700 text-base md:text-sm shadow"
                      >
                        <span className="material-symbols-outlined text-[20px] md:text-[18px] mr-2">check_circle</span>
                        Verifica Blockchain
                      </a>
                    )}
                    {it.hashDocumento && (
                      <button
                        onClick={() => setHashModal({ open: true, hash: it.hashDocumento })}
                        className="w-full md:w-auto inline-flex items-center justify-center px-4 py-3 md:px-3 md:py-2 rounded-lg text-primary border border-primary/30 bg-white hover:bg-primary/5 text-base md:text-sm shadow"
                      >
                        <span className="material-symbols-outlined text-[20px] md:text-[18px] mr-2">description</span>
                        Documento associato
                      </button>
                    )}
                    <button
                      onClick={() => setExportModal({
                        open: true,
                        title: it.nome || `Iscrizione #${it.id}`,
                        payload: {
                          batchId: it.batchId || it.id,
                          nome: it.nome,
                          descrizione: it.descrizione,
                          data: it.data,
                          luogo: it.luogo,
                          txHash: it.txHash,
                          steps: Array.isArray(it.steps) ? it.steps : [],
                          walletAddress: account?.address || ''
                        }
                      })}
                      className="w-full md:w-auto inline-flex items-center justify-center px-4 py-3 md:px-3 md:py-2 rounded-lg text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 text-base md:text-sm shadow"
                    >
                      <span className="material-symbols-outlined text-[20px] md:text-[18px] mr-2">ios_share</span>
                      Esporta
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Bottom */}
            <Pagination
              totalItems={iscrizioni.filter(i => (i.nome && i.nome.toLowerCase().includes(searchTerm.toLowerCase())) || !searchTerm).length}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )) : (
          notarizzazioniLoading ? null : (
            <div className="space-y-4">
              {notarizzazioni
                .filter(n => {
                  const q = notarizzaSearch.toLowerCase();
                  const visibleBySearch = !q || (String(n.nome || '').toLowerCase().includes(q) || String(n.hash || '').toLowerCase().includes(q));
                  const hasMeaningfulName = String(n.nome || '').trim() !== '' && String(n.nome) !== '(Notarizzazione)';
                  return visibleBySearch && hasMeaningfulName;
                })
                .slice((notarizzaPage - 1) * pageSize, notarizzaPage * pageSize)
                .map((n) => (
                  <div key={n.id || n.batchId} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary transition-all">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                      <div className="min-w-0 flex-1">
                        <div className="break-words">
                          <span className="inline-block px-3 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-2xl md:text-3xl tracking-tight">
                            {n.nome || 'Documento'}
                          </span>
                        </div>
                        <div className="mt-3 text-sm text-slate-700">
                          <div className="flex items-center"><Hash className="h-4 w-4 mr-2 text-primary" />
                            <span className="break-all">{n.hash}</span>
                            <button onClick={() => navigator.clipboard.writeText(n.hash)} className="ml-2 text-primary hover:underline text-xs">Copia</button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 w-full md:w-auto md:min-w-[260px] md:justify-center">
                        <a 
                          href={n.txHash ? `${(((import.meta as any).env?.VITE_EXPLORER_TX_URL_TEMPLATE) || 'https://arbiscan.io/inputdatadecoder?tx={txHash}').replace('{txHash}', n.txHash)}` : '#'} 
                          target="_blank" 
                          rel="noreferrer" 
                          className={`w-full md:w-auto inline-flex items-center justify-center px-4 py-3 md:px-3 md:py-2 rounded-lg text-base md:text-sm shadow ${n.txHash ? 'text-white bg-primary hover:bg-primary-700' : 'text-gray-400 bg-gray-200 cursor-not-allowed'}`}
                          onClick={!n.txHash ? (e) => e.preventDefault() : undefined}
                        >
                          <span className="material-symbols-outlined text-[20px] md:text-[18px] mr-2">check_circle</span>
                          {n.txHash ? 'Verifica Blockchain' : 'TxHash non disponibile'}
                        </a>
                        {n.hash && (
                          <button onClick={() => setEmailModal({ open: true, hash: n.hash, txHash: n.txHash })} className="w-full md:w-auto inline-flex items-center justify-center px-4 py-3 md:px-3 md:py-2 rounded-lg text-primary border border-primary/30 hover:bg-primary/5 text-base md:text-sm shadow">
                            <span className="material-symbols-outlined text-[20px] md:text-[18px] mr-2">mail</span>
                            Condividi su Email
                          </button>
                        )}
                        <button onClick={() => setExportModal({ open: true, title: n.nome || 'Documento', payload: { batchId: n.batchId || Date.now(), nome: n.nome, hash: n.hash, txHash: n.txHash, steps: [], walletAddress: account?.address || '' } })} className="w-full md:w-auto inline-flex items-center justify-center px-4 py-3 md:px-3 md:py-2 rounded-lg text-slate-700 border border-slate-300 hover:bg-slate-50 text-base md:text-sm shadow">
                          <span className="material-symbols-outlined text-[20px] md:text-[18px] mr-2">ios_share</span>
                          Esporta
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              {/* Pagination Bottom */}
              <Pagination totalItems={notarizzazioni.filter(n => {
                const q = notarizzaSearch.toLowerCase();
                const visibleBySearch = !q || (String(n.nome || '').toLowerCase().includes(q) || String(n.hash || '').toLowerCase().includes(q));
                const hasMeaningfulName = String(n.nome || '').trim() !== '' && String(n.nome) !== '(Notarizzazione)';
                return visibleBySearch && hasMeaningfulName;
              }).length} pageSize={pageSize} currentPage={notarizzaPage} onPageChange={setNotarizzaPage} />
            </div>
          )
        )}
      </div>

      {stepsModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setStepsModal({ open: false, steps: [] })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/20 sticky top-0 z-10">
              <h3 className="text-lg font-bold text-slate-900 flex items-center">
                <span className="material-symbols-outlined text-[20px] mr-2 text-primary">list_alt</span>
                Riepilogo Steps
              </h3>
              <button onClick={() => setStepsModal({ open: false, steps: [] })} className="text-slate-600 hover:text-slate-800"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              {(!stepsModal.steps || stepsModal.steps.length === 0) ? (
                <div className="text-slate-600">Nessuno step presente.</div>
              ) : (
                <div className="space-y-3">
                  {stepsModal.steps.map((s, idx) => (
                    <div key={idx} className="border border-primary/20 rounded-lg p-4 bg-gradient-to-br from-primary/5 to-white">
                      {s.nome && (
                        <div className="font-semibold text-slate-900 flex items-center mb-1">
                          <span className="material-symbols-outlined text-[18px] mr-2 text-primary">assignment</span>
                          <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-base md:text-lg">{s.nome}</span>
                        </div>
                      )}
                      <div className="text-sm md:text-base text-slate-700">
                        {s.luogo && (<span className="font-medium">{s.luogo}</span>)}
                        {s.luogo && s.data && (<span> • </span>)}
                        {s.data && (<span className="font-medium">{formatDateItalian(s.data)}</span>)}
                      </div>
                      {s.hashDocumento && (
                        <div className="mt-2 text-xs md:text-sm text-slate-700 flex items-center gap-2">
                          <span className="font-semibold shrink-0">Hash:</span>
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <code className="text-[11px] md:text-xs text-slate-800 truncate min-w-0">{s.hashDocumento}</code>
                            <button onClick={() => navigator.clipboard.writeText(s.hashDocumento)} className="px-2 py-0.5 text-xs border border-slate-300 rounded hover:bg-slate-100 shrink-0">Copia</button>
                          </div>
                        </div>
                      )}
                      {s.descrizione && (<div className="text-sm md:text-base text-slate-800 mt-2 break-words">{s.descrizione}</div>)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hash Modal */}
      {hashModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Documento associato</h3>
              <button onClick={() => setHashModal({ open: false, hash: '' })} className="text-slate-600 hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-slate-700 mb-3">Il documento associato a questa iscrizione ha questo hash immutabile (SHA-256):</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start justify-between gap-3">
              <code className="text-xs break-all text-slate-800">{hashModal.hash}</code>
              <button
                onClick={() => navigator.clipboard.writeText(hashModal.hash)}
                className="shrink-0 inline-flex items-center px-2 py-1 text-xs border border-slate-300 rounded-md hover:bg-slate-100"
              >
                <Copy className="h-3 w-3 mr-1" /> Copia
              </button>
            </div>
            <div className="mt-4 text-right">
              <button onClick={() => setHashModal({ open: false, hash: '' })} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">Chiudi</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Share Modal */}
      {emailModal.open && (
        <EmailShareModal onClose={() => setEmailModal({ open:false, hash:'', txHash: undefined })} hash={emailModal.hash} txHash={emailModal.txHash} />
      )}

      {/* Export Modal */}
      {exportModal.open && (
        <ExportOptionsModal title={exportModal.title} payload={exportModal.payload} companyName={companyInfo?.nome} onClose={() => setExportModal({ open: false, title: '', payload: undefined })} />
      )}

      {/* Batch Creation Modal */}
      <BatchCreationModal 
        isOpen={showBatchModal} 
        onClose={() => setShowBatchModal(false)}
        onIscrizioneCreated={(txHash: string) => {
          // Invalidate cache when new iscrizione is created
          if (account?.address) {
            setCachedIscrizioni(account.address, [], txHash);
            // Force refresh to show new iscrizione
            loadIscrizioni(account.address, true);
            setLastIscrizioniRefresh(Date.now());
            // Refresh company info to show updated credits
            fetch(`/api/get-company-status?walletAddress=${account.address}`).then(async (r) => {
              if (r.ok) {
                const data = await r.json();
                if (data?.company) {
                  setCompanyInfo({
                    nome: data.company.nome || 'N/A',
                    email: data.company.email || 'N/A',
                    settore: data.company.settore || 'N/A',
                    crediti: data.company.crediti || 0,
                  });
                }
              }
            });
          }
        }}
      />
    </div>
  );
};

export default Dashboard;

// Local component: ExportOptionsModal
function ExportOptionsModal({ title, payload, companyName, onClose }:{ title:string; payload?: any; companyName?: string; onClose:()=>void }) {
  async function generateQrCode() {
    try {
      const company = (companyName || 'Azienda');
      const nomeProdotto = payload?.nome || title || 'Iscrizione';
      const dataOrigine = payload?.data || 'N/D';
      const luogo = payload?.luogo || 'N/D';
      const txHash = payload?.txHash || '';
      const steps = Array.isArray(payload?.steps) ? payload.steps : [];
      const walletAddress = payload?.walletAddress || '';
      const batchId = payload?.batchId || Date.now();
      const body = {
        batch: {
          batchId,
          name: nomeProdotto,
          date: dataOrigine,
          location: luogo,
          description: payload?.descrizione || '',
          transactionHash: txHash,
          imageIpfsHash: '',
          steps: steps.map((s:any) => ({
            eventName: s?.nome || '',
            description: s?.descrizione || '',
            date: s?.data || '',
            location: s?.luogo || '',
            attachmentsIpfsHash: ''
          }))
        },
        companyName: company,
        walletAddress
      };
      const r = await fetch('/api/stripe?action=qr-create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j?.error || 'Errore creazione QR');
      }
      // Forziamo il download dell'immagine QR (PNG)
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nomeProdotto.replace(/\s+/g, '_')}_qrcode.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert((e as any)?.message || 'Errore generazione QrCode');
    }
  }
  function generateHtmlAndDownload() {
    const company = (companyName || 'Azienda');
    const nomeProdotto = payload?.nome || title || 'Iscrizione';
    const dataOrigine = payload?.data || 'N/D';
    const luogo = payload?.luogo || 'N/D';
    const txHash = payload?.txHash;
    const verifyLink = txHash ? `${(((import.meta as any).env?.VITE_EXPLORER_TX_URL_TEMPLATE) || 'https://arbiscan.io/inputdatadecoder?tx={txHash}').replace('{txHash}', txHash)}` : '';
    const steps = Array.isArray(payload?.steps) ? payload.steps : [];
    const today = new Date().toLocaleDateString('it-IT');

    const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const stepsHtml = steps.map((s: any, idx: number) => `
      <div class="step">
        <div class="step-number">${idx + 1}</div>
        <div class="step-header">${esc(s?.nome || `Step ${idx + 1}`)}</div>
        <div class="step-details">
          <div class="step-detail"><strong><span class="material-symbols-outlined">description</span> Descrizione:</strong><br>${esc(s?.descrizione || 'N/D')}</div>
          <div class="step-detail"><strong><span class="material-symbols-outlined">calendar_month</span> Data:</strong><br>${esc(s?.data || 'N/D')}</div>
          <div class="step-detail"><strong><span class="material-symbols-outlined">location_on</span> Luogo:</strong><br>${esc(s?.luogo || 'N/D')}</div>
        </div>
      </div>
    `).join('\n');

    const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${esc(company)} - Certificato di Tracciabilità</title><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap"><style>.material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#ffffff;color:#1e293b;min-height:100vh;padding:20px;line-height:1.6}.certificate-container{max-width:900px;margin:0 auto;background:#ffffff;border-radius:20px;padding:40px;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #e2e8f0;backdrop-filter:blur(5px);position:relative}.header{text-align:center;margin-bottom:40px;border-bottom:2px solid #e0e7ff;padding-bottom:30px}.company-name-box{background:#f1f5f9;padding:20px 30px;border-radius:15px;margin-bottom:20px;border:2px solid #cbd5e1;box-shadow:none}.company-name{font-size:2.5rem;font-weight:bold;color:#4f46e5;margin:0;text-shadow:none}.subtitle{font-size:1.2rem;color:#64748b;margin-bottom:5px}.info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:30px}.info-item{background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;transition:transform 0.2s ease,box-shadow 0.2s ease}.info-item:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,0.08)}.info-label{font-weight:600;color:#4f46e5;margin-bottom:8px;display:flex;align-items:center;gap:8px}.info-value{color:#1e293b;font-size:1.1rem;word-break:break-word}.blockchain-link{display:inline-flex;align-items:center;gap:5px;color:#0ea5e9;text-decoration:none;font-weight:500;padding:10px 16px;background:#e0f7fa;border-radius:25px;border:1px solid #a7e9f7;transition:all 0.3s ease;margin-top:10px}.blockchain-link:hover{background:#b2ebf2;transform:translateY(-1px);box-shadow:0 4px 10px rgba(0,0,0,0.1)}.section-title{font-size:1.8rem;font-weight:bold;color:#4f46e5;margin-bottom:20px;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px}.steps-section{margin-top:40px}.step{background:#f0f9ff;border:1px solid #e0f2fe;border-radius:12px;padding:25px;margin-bottom:20px;position:relative;transition:transform 0.2s ease,box-shadow 0.2s ease}.step:hover{transform:translateX(5px);box-shadow:0 8px 20px rgba(0,0,0,0.08)}.step-number{position:absolute;top:-10px;left:20px;background:#0ea5e9;color:#ffffff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.9rem}.step-header{font-size:1.3rem;font-weight:bold;color:#0ea5e9;margin-bottom:15px;margin-left:20px}.step-details{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;margin-left:20px}.step-detail{font-size:0.95rem;color:#334155;background:#f1f5f9;padding:12px;border-radius:8px;border:1px solid #e2e8f0}.step-detail strong{color:#0ea5e9}.footer{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #e0e7ff;color:#64748b}@media print{body{background:#ffffff!important;padding:0!important}.certificate-container{box-shadow:none!important;border:none!important;padding:20px!important}.view-counter{display:none!important}}@media (max-width:768px){.certificate-container{padding:20px;margin:10px}.title{font-size:2rem}.info-grid{grid-template-columns:1fr}.step-details{grid-template-columns:1fr}}</style></head><body><div class="certificate-container"><div class="header"><div class="company-name-box"><h1 class="company-name">${esc(company)}</h1></div><p class="subtitle">Certificato di Tracciabilità Blockchain</p></div><h2 class="section-title"><span class="material-symbols-outlined">info</span> Informazioni Iscrizione</h2><div class="info-grid"><div class="info-item"><div class="info-label"><span class="material-symbols-outlined">inventory_2</span> Nome Prodotto</div><div class="info-value">${esc(nomeProdotto)}</div></div><div class="info-item"><div class="info-label"><span class="material-symbols-outlined">calendar_month</span> Data di Origine</div><div class="info-value">${esc(dataOrigine)}</div></div><div class="info-item"><div class="info-label"><span class="material-symbols-outlined">location_on</span> Luogo di Produzione</div><div class="info-value">${esc(luogo)}</div></div><div class="info-item"><div class="info-label"><span class="material-symbols-outlined">verified</span> Stato</div><div class="info-value"><span class="material-symbols-outlined">check_circle</span> Certificato Attivo</div></div>${verifyLink ? `<div class=\"info-item\"><div class=\"info-label\"><span class=\"material-symbols-outlined\">link</span> Verifica Blockchain</div><div class=\"info-value\"><a href=\"${verifyLink}\" target=\"_blank\" class=\"blockchain-link\"><span class=\"material-symbols-outlined\">travel_explore</span> Verifica su Arbitrum</a></div></div>` : ''}</div>${(Array.isArray(steps) && steps.length) ? `<div class=\"steps-section\"><h2 class=\"section-title\"><span class=\"material-symbols-outlined\">sync</span> Fasi di Lavorazione</h2>${stepsHtml}</div>` : ''}<div class=\"footer\"><p><span class=\"material-symbols-outlined\">link</span> Certificato generato con <a href=\"https://simplychain.it\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:#4f46e5;text-decoration:none\"><strong>SimplyChain</strong></a> il ${esc(today)}</p><p>Servizio prodotto da <a href=\"https://www.stickyfactory.it/\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:#4f46e5;text-decoration:none\"><strong>SFY s.r.l.</strong></a></p><p><span class=\"material-symbols-outlined\">mail</span> Contattaci: sfy.startup@gmail.com</p></div></div></body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(nomeProdotto || 'certificato').replace(/\s+/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function generatePdfPreview() {
    const company = (companyName || 'Azienda');
    const nomeProdotto = payload?.nome || title || 'Iscrizione';
    const dataOrigine = payload?.data || 'N/D';
    const luogo = payload?.luogo || 'N/D';
    const txHash = payload?.txHash;
    const steps = Array.isArray(payload?.steps) ? payload.steps : [];
    const today = new Date().toLocaleDateString('it-IT');

    try {
      // Generate QR code for blockchain link
      let qrCodeDataUrl = '';
      if (txHash) {
        const blockchainUrl = `${(((import.meta as any).env?.VITE_EXPLORER_TX_URL_TEMPLATE) || 'https://arbiscan.io/inputdatadecoder?tx={txHash}').replace('{txHash}', txHash)}`;
        qrCodeDataUrl = await QRCode.toDataURL(blockchainUrl, { 
          width: 200, 
          margin: 2,
          color: { dark: '#000000', light: '#FFFFFF' }
        });
      }

      // Create HTML content (same as generateHtmlAndDownload but with QR code instead of blockchain link)
      const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const stepsHtml = steps.map((s: any, idx: number) => `
        <div class="step">
          <div class="step-number">${idx + 1}</div>
          <div class="step-header">${esc(s?.nome || `Step ${idx + 1}`)}</div>
          <div class="step-details">
            <div class="step-detail"><strong><span class="material-symbols-outlined">description</span> Descrizione:</strong><br>${esc(s?.descrizione || 'N/D')}</div>
            <div class="step-detail"><strong><span class="material-symbols-outlined">calendar_month</span> Data:</strong><br>${esc(s?.data || 'N/D')}</div>
            <div class="step-detail"><strong><span class="material-symbols-outlined">location_on</span> Luogo:</strong><br>${esc(s?.luogo || 'N/D')}</div>
          </div>
        </div>
      `).join('\n');

      // Create HTML with QR code instead of blockchain link
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="it">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${esc(company)} - Certificato di Tracciabilità</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap">
          <style>
            .material-symbols-outlined{font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;vertical-align:middle}
            *{box-sizing:border-box;margin:0;padding:0}
            body{font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#ffffff;color:#1e293b;min-height:100vh;padding:20px;line-height:1.6}
            .certificate-container{max-width:900px;margin:0 auto;background:#ffffff;border-radius:20px;padding:40px;box-shadow:0 10px 30px rgba(0,0,0,0.1);border:1px solid #e2e8f0;backdrop-filter:blur(5px);position:relative}
            .header{text-align:center;margin-bottom:40px;border-bottom:2px solid #e0e7ff;padding-bottom:30px}
            .company-name-box{background:#f1f5f9;padding:20px 30px;border-radius:15px;margin-bottom:20px;border:2px solid #cbd5e1;box-shadow:none}
            .company-name{font-size:2.5rem;font-weight:bold;color:#4f46e5;margin:0;text-shadow:none}
            .subtitle{font-size:1.2rem;color:#64748b;margin-bottom:5px}
            .info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;margin-bottom:30px}
            .info-item{background:#f8fafc;padding:20px;border-radius:12px;border:1px solid #e2e8f0;transition:transform 0.2s ease,box-shadow 0.2s ease}
            .info-item:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,0.08)}
            .info-label{font-weight:600;color:#4f46e5;margin-bottom:8px;display:flex;align-items:center;gap:8px}
            .info-value{color:#1e293b;font-size:1.1rem;word-break:break-word}
            .qr-code-container{display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:10px}
            .qr-code{max-width:150px;height:auto;border-radius:8px}
            .qr-label{font-size:0.9rem;color:#64748b;text-align:center}
            .section-title{font-size:1.8rem;font-weight:bold;color:#4f46e5;margin-bottom:20px;text-align:center;display:flex;align-items:center;justify-content:center;gap:10px}
            .steps-section{margin-top:40px}
            .step{background:#f0f9ff;border:1px solid #e0f2fe;border-radius:12px;padding:25px;margin-bottom:20px;position:relative;transition:transform 0.2s ease,box-shadow 0.2s ease}
            .step:hover{transform:translateX(5px);box-shadow:0 8px 20px rgba(0,0,0,0.08)}
            .step-number{position:absolute;top:-10px;left:20px;background:#0ea5e9;color:#ffffff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.9rem;line-height:1}
            .step-header{font-size:1.3rem;font-weight:bold;color:#0ea5e9;margin-bottom:15px;margin-left:20px}
            .step-details{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:15px;margin-left:20px}
            .step-detail{font-size:0.95rem;color:#334155;background:#f1f5f9;padding:12px;border-radius:8px;border:1px solid #e2e8f0}
            .step-detail strong{color:#0ea5e9}
            .footer{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #e0e7ff;color:#64748b}
            @media print{body{background:#ffffff!important;padding:0!important}.certificate-container{box-shadow:none!important;border:none!important;padding:20px!important}}
            @media (max-width:768px){.certificate-container{padding:20px;margin:10px}.info-grid{grid-template-columns:1fr}.step-details{grid-template-columns:1fr}}
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="header">
              <div class="company-name-box">
                <h1 class="company-name">${esc(company)}</h1>
              </div>
              <p class="subtitle">Certificato di Tracciabilità Blockchain</p>
            </div>
            <h2 class="section-title"><span class="material-symbols-outlined">info</span> Informazioni Iscrizione</h2>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label"><span class="material-symbols-outlined">inventory_2</span> Nome Prodotto</div>
                <div class="info-value">${esc(nomeProdotto)}</div>
              </div>
              <div class="info-item">
                <div class="info-label"><span class="material-symbols-outlined">calendar_month</span> Data di Origine</div>
                <div class="info-value">${esc(dataOrigine)}</div>
              </div>
              <div class="info-item">
                <div class="info-label"><span class="material-symbols-outlined">location_on</span> Luogo di Produzione</div>
                <div class="info-value">${esc(luogo)}</div>
              </div>
              <div class="info-item">
                <div class="info-label"><span class="material-symbols-outlined">verified</span> Stato</div>
                <div class="info-value"><span class="material-symbols-outlined">check_circle</span> Certificato Attivo</div>
              </div>
              ${txHash ? `
              <div class="info-item">
                <div class="info-label"><span class="material-symbols-outlined">qr_code_2</span> Verifica Blockchain</div>
                <div class="info-value">
                  <div class="qr-code-container">
                    <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
                    <div class="qr-label">Scansiona per verificare la transazione</div>
                  </div>
                </div>
              </div>` : ''}
            </div>
            ${(Array.isArray(steps) && steps.length) ? `
            <div class="steps-section">
              <h2 class="section-title"><span class="material-symbols-outlined">sync</span> Fasi di Lavorazione</h2>
              ${stepsHtml}
            </div>` : ''}
            <div class="footer">
              <p><span class="material-symbols-outlined">link</span> Certificato generato con <a href="https://simplychain.it" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;text-decoration:none"><strong>SimplyChain</strong></a> il ${esc(today)}</p>
              <p>Servizio prodotto da <a href="https://www.stickyfactory.it/" target="_blank" rel="noopener noreferrer" style="color:#4f46e5;text-decoration:none"><strong>SFY s.r.l.</strong></a></p>
              <p><span class="material-symbols-outlined">mail</span> Contattaci: sfy.startup@gmail.com</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a temporary iframe to render the HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '900px';
      iframe.style.height = '1200px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      // Write HTML to iframe
      iframe.contentDocument?.write(htmlContent);
      iframe.contentDocument?.close();

      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get the body element from iframe
      const iframeBody = iframe.contentDocument?.body;
      if (!iframeBody) {
        throw new Error('Impossibile caricare il contenuto HTML');
      }

      // Convert HTML to canvas with better settings
      const canvas = await html2canvas(iframeBody, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 900,
        height: iframeBody.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 900,
        windowHeight: iframeBody.scrollHeight
      });

      // Remove iframe
      document.body.removeChild(iframe);

      // Create PDF from canvas with proper pagination
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate dimensions to fit the content with margins
      const margin = 15; // 15mm margin on all sides
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);
      
      // Calculate image dimensions maintaining aspect ratio
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate how many pages we need
      const totalPages = Math.ceil(imgHeight / contentHeight);
      
      // Add image to PDF with proper centering and pagination
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate the y position for this page
        const yOffset = -(page * contentHeight);
        
        // Add the image for this page
        pdf.addImage(
          imgData, 
          'PNG', 
          margin, 
          margin + yOffset, 
          imgWidth, 
          imgHeight
        );
      }

      // Download the PDF
      const fileName = `${nomeProdotto.replace(/\s+/g, '_')}_certificato.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Errore nella generazione del PDF. Riprova.');
    }
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg sm:max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/20">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Informazioni Esportazione</h3>
            <div className="text-sm text-slate-600">Batch: "{title}"</div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-800"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Genera QrCode */}
          <button onClick={generateQrCode} className="group text-left rounded-xl border border-slate-200 hover:border-primary/30 bg-white hover:bg-primary/5 p-5 transition shadow-sm hover:shadow-md flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-[22px] text-[#4f46e5]">qr_code_2</span>
              <div className="font-semibold text-slate-900 text-base">Genera QrCode</div>
            </div>
            <div className="text-sm text-slate-700 space-y-2 flex-1">
              <div>
                <div className="font-semibold">💡 Come funziona</div>
                <div>Crea un QR Code delle tue iscrizioni finalizzate per stamparlo sulle etichette del tuo prodotto.</div>
              </div>
              <div>
                <div className="font-semibold">✅ Validità</div>
                <div>Il link sarà valido secondo i <a href="/termini" className="text-primary hover:underline">Termini e Condizioni</a>.</div>
              </div>
              <div>
                <div className="font-semibold">⚠️ Importante</div>
                <div>Se il sito dovesse essere dismesso o i dati venissero cancellati, i QR Code potrebbero non funzionare più. SimplyChain non potrà essere ritenuta responsabile.</div>
              </div>
            </div>
            <div className="mt-4 pt-1">
              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-[#4f46e5] text-white text-sm">Genera QrCode</span>
            </div>
          </button>

          {/* Certificato PDF - Rosso */}
          <button onClick={generatePdfPreview} className="group text-left rounded-xl border border-slate-200 hover:border-red-300 bg-white hover:bg-red-50 p-5 transition shadow-sm hover:shadow-md flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-[22px] text-red-600">picture_as_pdf</span>
              <div className="font-semibold text-slate-900 text-base">Certificato PDF</div>
            </div>
            <div className="text-sm text-slate-700 space-y-2 flex-1">
              <div>
                <div className="font-semibold">Formato documentale</div>
                <div>Utile per uso interno o documentale. Può essere archiviato, stampato o condiviso con terzi per attestare l'iscrizione e l'autenticità del prodotto.</div>
              </div>
              
            </div>
            <div className="mt-4 pt-1">
              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 text-white text-sm">Genera PDF</span>
            </div>
          </button>

          {/* Certificato HTML - Verde */}
          <button onClick={generateHtmlAndDownload} className="group text-left rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 p-5 transition shadow-sm hover:shadow-md flex flex-col h-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-[22px] text-emerald-600">language</span>
              <div className="font-semibold text-slate-900 text-base">Certificato HTML</div>
            </div>
            <div className="text-sm text-slate-700 space-y-2 flex-1">
              <div>
                <div className="font-semibold">Pubblicazione online</div>
                <div>Pensato per la pubblicazione online. Caricalo su uno spazio privato per avere il controllo completo del processo di creazione del QR Code.</div>
              </div>
              
            </div>
            <div className="mt-4 pt-1">
              <span className="inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm">Genera HTML</span>
            </div>
          </button>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-right">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100">Chiudi</button>
        </div>
      </div>
    </div>
  );
}

// Local component: EmailShareModal
function EmailShareModal({ onClose, hash, txHash }:{ onClose:()=>void; hash:string; txHash?:string }) {
  const [email, setEmail] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [msg, setMsg] = React.useState<string>('');
  const [ok, setOk] = React.useState<boolean>(false);
  const link = txHash ? `${(((import.meta as any).env?.VITE_EXPLORER_TX_URL_TEMPLATE) || 'https://arbiscan.io/inputdatadecoder?tx={txHash}').replace('{txHash}', txHash)}` : '';

  const onSend = async () => {
    if (!hash) {
      setMsg('Hash mancante: impossibile inviare email');
      setOk(false);
      return;
    }
    setSending(true);
    setMsg('Invio email...');
    setOk(false);
    try {
      const r = await fetch('/api/stripe?action=send-notarization-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email.trim(), hash, link })
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || 'Errore invio email');
      setMsg('Email inviata con successo');
      setOk(true);
      setTimeout(onClose, 1200);
    } catch (e:any) {
      setMsg(String(e?.message || e || 'Errore invio email'));
      setOk(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Condividi su Email</h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-800"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-slate-700 mb-4">Condividi l'Hash del documento che hai caricato e la sua prova crittografica onchain.</p>
        <label className="block text-sm font-medium text-slate-700 mb-2">Email destinatario</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="es. nome@azienda.it" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
        {msg && (
          <div className={`mt-3 p-2 rounded text-sm ${ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>{msg}</div>
        )}
        <div className="mt-4 text-right">
          <button onClick={onSend} disabled={sending || !email.trim()} className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">{sending ? 'Invio...' : 'Invia'}</button>
        </div>
      </div>
    </div>
  );
}

// Local component: NotarizzaForm
function NotarizzaForm() {
  const account = useActiveAccount();
  const client = createThirdwebClient({ clientId: (import.meta as any).env?.VITE_THIRDWEB_CLIENT_ID || '' });
  const contract = getContract({ client, chain: arbitrum, address: '0x71efb9364a896973b80786541c3a431bcf6c7efa' });
  const { mutateAsync: sendTransaction } = useSendTransaction();
  const [name, setName] = React.useState('');
  const [hash, setHash] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string>('');
  const [ok, setOk] = React.useState<boolean>(false);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [insufficientCredits, setInsufficientCredits] = React.useState<boolean>(false);
  const [progressOpen, setProgressOpen] = React.useState<boolean>(false);
  const [progressMsg, setProgressMsg] = React.useState<string>('');
  const [progressOk, setProgressOk] = React.useState<boolean>(false);
  const [nameError, setNameError] = React.useState<string>('');

  async function generateHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const onChooseFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const h = await generateHash(f);
      setHash(h);
      setMsg('Hash generato con successo');
      setOk(true);
    } catch (err) {
      setMsg('Errore generazione hash');
      setOk(false);
    }
  };

  const onNotarizza = async () => {
    if (!account?.address) {
      setMsg('Connettiti per procedere');
      setOk(false);
      return;
    }
    if (!name.trim()) {
      setNameError('Il nome del documento è obbligatorio');
      setMsg('');
      setOk(false);
      return;
    } else {
      setNameError('');
    }
    if (!hash) {
      setMsg('Carica un documento per generare l\'hash');
      setOk(false);
      return;
    }
    if (!name.trim()) {
      setMsg('Inserisci un nome documento');
      setOk(false);
      return;
    }
    // Check crediti disponibili prima di procedere
    try {
      const resp = await fetch(`/api/get-company-status?walletAddress=${account.address}`);
      if (resp.ok) {
        const json = await resp.json();
        const credits = Number(json?.company?.crediti || 0);
        if (!json?.isActive) {
          setMsg('La tua azienda non è attiva.');
          setOk(false);
          return;
        }
        if (credits <= 0) {
          setInsufficientCredits(true);
          setMsg('');
          setOk(false);
          return;
        }
      }
    } catch {}

    // Conferma costo 1 credito
    // Styled confirm modal
    const confirm = await new Promise<boolean>((resolve) => {
      const onClose = () => {
        const el = document.getElementById('nota-confirm');
        if (el) el.remove();
      };
      const root = document.createElement('div');
      root.id = 'nota-confirm';
      root.className = 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4';
      root.innerHTML = `
        <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div class="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/20">
            <h3 class="text-lg font-bold text-slate-900">Conferma Notarizzazione</h3>
            <button id="nota-x" class="text-slate-600 hover:text-slate-800">✕</button>
          </div>
          <div class="p-6 text-sm text-slate-800">
            Questa operazione consumerà <span class="font-semibold">1 credito</span>. Vuoi procedere?
          </div>
          <div class="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
            <button id="nota-cancel" class="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100">Annulla</button>
            <button id="nota-ok" class="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-700">Procedi</button>
          </div>
        </div>`;
      document.body.appendChild(root);
      const ok = root.querySelector('#nota-ok') as HTMLButtonElement;
      const cancel = root.querySelector('#nota-cancel') as HTMLButtonElement;
      const close = root.querySelector('#nota-x') as HTMLButtonElement;
      const done = (v:boolean) => { onClose(); resolve(v); };
      ok?.addEventListener('click', () => done(true));
      cancel?.addEventListener('click', () => done(false));
      close?.addEventListener('click', () => done(false));
      root.addEventListener('click', (e:any) => { if (e.target === root) done(false); });
    });
    if (!confirm) return;
    setLoading(true);
    setMsg('');
    setOk(false);
    setProgressMsg('Invio notarizzazione...');
    setProgressOk(false);
    setProgressOpen(true);
    try {
      // Pre: leggi gli ID correnti
      let preIds: any[] = [];
      try {
        const res: any = await readContract({
          contract,
          method: 'function getBatchesAzienda(address) view returns (uint256[])',
          params: [account.address],
        });
        if (Array.isArray(res)) preIds = res.map((v: any) => String(v));
      } catch {}

      // 1) Test se il contratto esiste - leggiamo prima l'owner
      try {
        const owner = await readContract({
          contract,
          method: 'function owner() view returns (address)',
          params: [],
        });
        console.log('Contract owner:', owner);
        
        // Test anche se l'azienda è abilitata
        const isEnabled = await readContract({
          contract,
          method: 'function aziendeAbilitate(address) view returns (bool)',
          params: [account.address],
        });
        console.log('Company enabled:', isEnabled);
        
        if (!isEnabled) {
          throw new Error('La tua azienda non è abilitata nel contratto. Contatta l\'amministratore.');
        }
        
      } catch (err) {
        console.error('Contract not found or not accessible:', err);
        throw new Error('Contratto non trovato o non accessibile');
      }

      // 2) Crea notarization batch per il documento
      console.log('Creating notarization batch...');
      const txCreate = prepareContractCall({
        contract,
        method: 'function creaNotarizationBatch(string _nome, string _hashDocumento) returns (uint256)',
        params: [name.trim(), hash],
      });
      console.log('Transaction prepared:', txCreate);
      const txCreateResult = await sendTransaction(txCreate);
      const createHash = (txCreateResult as any)?.transactionHash || (txCreateResult as any)?.hash || '';

      // 3) Usa l'hash della transazione come identificatore univoco
      // Il batchId reale verrà ottenuto dal contratto quando carichiamo i dati
      const batchId = createHash; // Usa l'hash della transazione come identificatore temporaneo

      // 4) salva su Firestore (save-only branch)
      const resp = await fetch('/api/notarizza', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ walletAddress: account.address, nome: name.trim(), hash, batchId, txHash: createHash }) });
      const json = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(json?.error || 'Errore salvataggio notarizzazione');

      setProgressMsg('Documento notarizzato con successo');
      setProgressOk(true);
      setName('');
      // Refresh crediti e lista notarizzazioni
      try {
        await fetch(`/api/get-company-status?walletAddress=${account.address}`).then(async (r) => {
          if (r.ok) {
            const data = await r.json();
            // best-effort: page-level state update via event
            window.dispatchEvent(new CustomEvent('companyCreditsUpdated', { detail: { crediti: data?.company?.crediti } }));
          }
        });
      } catch {}
      try {
        // Refresh only notarizzazioni list and throttle the refresh button for 60s
        window.dispatchEvent(new Event('notarizzazioneCompleted'));
        // Forza anche un refresh della lista iscrizioni per mostrare i documenti certificati
        window.dispatchEvent(new Event('refreshIscrizioni'));
      } catch {}
    } catch (e: any) {
      setProgressMsg(String(e?.message || e || 'Errore notarizzazione'));
      setProgressOk(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
      {insufficientCredits && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm rounded p-3">
          Il tuo saldo crediti non permette di procedere con questa notarizzazione.{' '}
          <a href="/ricaricacrediti" className="font-semibold underline">Ricarica Crediti</a>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Nome documento *</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); if (nameError) setNameError(''); }}
            placeholder="Es. Contratto fornitura 2025"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${nameError ? 'border-red-400' : 'border-slate-300'}`}
          />
          {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Carica file</label>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" className="hidden" onChange={onChooseFile} />
            <button onClick={() => fileRef.current?.click()} className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Scegli file</button>
            {hash && (
              <button onClick={() => navigator.clipboard.writeText(hash)} className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">Copia hash</button>
            )}
          </div>
          {hash && (
            <p className="mt-2 text-xs text-slate-600 break-all">SHA256: {hash}</p>
          )}
        </div>
      </div>
      {msg && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>{msg}</div>
      )}
      <div className="mt-4 text-right">
        <button onClick={onNotarizza} disabled={loading || !hash || !name.trim()} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
          {loading ? 'Certifico...' : 'Certifica su Blockchain'}
        </button>
      </div>

      {progressOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !loading && setProgressOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 flex items-center justify-between border-b border-primary/20">
              <h3 className="text-lg font-bold text-slate-900">Notarizzazione</h3>
              <button disabled={loading} onClick={() => setProgressOpen(false)} className={`text-slate-600 hover:text-slate-800 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                {loading ? <Loader2 className="h-5 w-5 text-primary animate-spin" /> : (
                  progressOk ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <div className={`text-sm ${progressOk ? 'text-slate-800' : 'text-slate-800'}`}>{progressMsg}</div>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
              {!loading && (
                <button onClick={() => setProgressOpen(false)} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100">Chiudi</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Local pagination component
function Pagination({ totalItems, pageSize, currentPage, onPageChange }:{ totalItems:number; pageSize:number; currentPage:number; onPageChange:(p:number)=>void }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (totalPages <= 1) return null;
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  return (
    <div className="flex items-center justify-between py-2">
      <div className="text-sm text-slate-600">Pagina {currentPage} di {totalPages}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => canPrev && onPageChange(currentPage - 1)}
          disabled={!canPrev}
          className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50"
        >
          Prec
        </button>
        <button
          onClick={() => canNext && onPageChange(currentPage + 1)}
          disabled={!canNext}
          className="px-3 py-1 border border-slate-300 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-50"
        >
          Succ
        </button>
      </div>
    </div>
  );
}

