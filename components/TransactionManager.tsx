import React, { useState } from 'react';
import { usePolkadot } from '../src/hooks/usePolkadot';
import TransactionModal from './TransactionModal';
import { Send, FileText, Loader2, AlertCircle } from 'lucide-react';

interface TransactionManagerProps {
  companyId: string;
}

const TransactionManager: React.FC<TransactionManagerProps> = ({ companyId }) => {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [transactionType, setTransactionType] = useState<'transfer' | 'knowledge'>('transfer');
  const [formData, setFormData] = useState({
    recipientAddress: '',
    amount: '',
    metadata: '',
    title: '',
    description: '',
    content: '',
    tags: ''
  });

  const { isConnected, loading, error, createTransaction, createKnowledgeAsset } = usePolkadot();

  const handleTransaction = async () => {
    if (!isConnected) {
      alert('Servizio Polkadot non connesso');
      return;
    }

    setIsCreatingTransaction(true);
    try {
      let result;
      
      if (transactionType === 'transfer') {
        result = await createTransaction(
          process.env.VITE_BACKEND_WALLET_PRIVATE_KEY || '',
          formData.recipientAddress,
          formData.amount,
          formData.metadata
        );
      } else {
        result = await createKnowledgeAsset(
          process.env.VITE_BACKEND_WALLET_PRIVATE_KEY || '',
          formData.title,
          formData.description,
          formData.content,
          formData.tags.split(',').map(tag => tag.trim())
        );
      }

      setTransactionResult(result);
      setShowTransactionModal(true);
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Errore durante la transazione');
    } finally {
      setIsCreatingTransaction(false);
    }
  };

  const resetForm = () => {
    setFormData({
      recipientAddress: '',
      amount: '',
      metadata: '',
      title: '',
      description: '',
      content: '',
      tags: ''
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Inizializzazione servizio Polkadot...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Errore di connessione</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestione Transazioni</h3>
        <p className="text-gray-600 text-sm">
          Crea transazioni sulla blockchain Polkadot/NeuroWeb
        </p>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setTransactionType('transfer')}
            className={`px-4 py-2 rounded-lg font-medium ${
              transactionType === 'transfer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Send className="h-4 w-4 inline mr-2" />
            Transfer
          </button>
          <button
            onClick={() => setTransactionType('knowledge')}
            className={`px-4 py-2 rounded-lg font-medium ${
              transactionType === 'knowledge'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Knowledge Asset
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {transactionType === 'transfer' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indirizzo Destinatario
              </label>
              <input
                type="text"
                value={formData.recipientAddress}
                onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserisci l'indirizzo del destinatario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantità (DOT)
              </label>
              <input
                type="number"
                step="0.0000000001"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metadati (opzionale)
              </label>
              <textarea
                value={formData.metadata}
                onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Inserisci metadati aggiuntivi"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titolo
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Titolo del Knowledge Asset"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrizione
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Descrizione del Knowledge Asset"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenuto
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Contenuto del Knowledge Asset"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tag (separati da virgola)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            onClick={handleTransaction}
            disabled={isCreatingTransaction || !isConnected}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isCreatingTransaction ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {isCreatingTransaction ? 'Creazione...' : 'Crea Transazione'}
          </button>
          <button
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        transaction={transactionResult}
      />
    </div>
  );
};

export default TransactionManager;