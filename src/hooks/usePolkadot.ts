import { useState, useEffect } from 'react';
import { polkadotService, TransactionResult } from '../services/polkadotService';

export const usePolkadot = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initService = async () => {
      try {
        setLoading(true);
        await polkadotService.initialize();
        setIsConnected(true);
      } catch (err: any) {
        setError(err.message);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    initService();

    return () => {
      polkadotService.disconnect();
    };
  }, []);

  const createTransaction = async (
    privateKey: string,
    recipientAddress: string,
    amount: string,
    metadata: string
  ): Promise<TransactionResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await polkadotService.createTransaction(
        privateKey,
        recipientAddress,
        amount,
        metadata
      );
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createKnowledgeAsset = async (
    privateKey: string,
    title: string,
    description: string,
    content: string,
    tags: string[]
  ): Promise<TransactionResult> => {
    setLoading(true);
    setError(null);

    try {
      const result = await polkadotService.createKnowledgeAsset(
        privateKey,
        title,
        description,
        content,
        tags
      );
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAccountBalance = async (address: string): Promise<string> => {
    try {
      return await polkadotService.getAccountBalance(address);
    } catch (err: any) {
      setError(err.message);
      return '0';
    }
  };

  return {
    isConnected,
    loading,
    error,
    createTransaction,
    createKnowledgeAsset,
    getAccountBalance
  };
};