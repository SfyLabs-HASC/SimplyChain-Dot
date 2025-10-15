import React from 'react';
import { X, ExternalLink, CheckCircle, AlertCircle, Copy, Hash, Calendar, Block } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: {
    hash: string;
    blockNumber: number;
    explorerUrl: string;
    success: boolean;
    error?: string;
  } | null;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, transaction }) => {
  if (!isOpen || !transaction) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('it-IT');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {transaction.success ? (
                <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
              )}
              <h2 className="text-2xl font-bold text-gray-900">
                {transaction.success ? 'Transazione Completata' : 'Transazione Fallita'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {transaction.success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">
                  La tua transazione è stata elaborata con successo sulla blockchain!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Hash className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Hash Transazione</span>
                  </div>
                  <div className="flex items-center">
                    <code className="text-sm text-gray-900 font-mono mr-2">
                      {transaction.hash.substring(0, 16)}...
                    </code>
                    <button
                      onClick={() => copyToClipboard(transaction.hash)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Block className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Numero Blocco</span>
                  </div>
                  <span className="text-sm text-gray-900 font-mono">
                    {transaction.blockNumber.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Timestamp</span>
                  </div>
                  <span className="text-sm text-gray-900">
                    {formatDate(Date.now())}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <a
                  href={transaction.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center transition-colors"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Visualizza su Explorer
                </a>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Puoi tracciare la tua transazione utilizzando l'explorer di Polkadot
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">
                  La transazione non è riuscita. Riprova più tardi.
                </p>
                {transaction.error && (
                  <p className="text-red-600 text-sm mt-2">
                    Errore: {transaction.error}
                  </p>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={onClose}
                  className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Chiudi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;