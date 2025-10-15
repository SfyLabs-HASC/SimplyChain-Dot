import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

export interface TransactionResult {
  hash: string;
  blockNumber: number;
  explorerUrl: string;
  success: boolean;
  error?: string;
}

export class PolkadotService {
  private api: ApiPromise | null = null;
  private keyring: Keyring | null = null;
  private isConnected = false;

  async initialize() {
    try {
      await cryptoWaitReady();
      
      // Initialize keyring
      this.keyring = new Keyring({ type: 'sr25519' });
      
      // Connect to NeuroWeb network (using Polkadot testnet for now)
      const wsProvider = new WsProvider('wss://rpc.polkadot.io');
      this.api = await ApiPromise.create({ provider: wsProvider });
      
      this.isConnected = true;
      console.log('Polkadot service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Polkadot service:', error);
      throw error;
    }
  }

  async createTransaction(
    privateKey: string,
    recipientAddress: string,
    amount: string,
    metadata: string
  ): Promise<TransactionResult> {
    if (!this.api || !this.keyring) {
      throw new Error('Polkadot service not initialized');
    }

    try {
      // Add account from private key
      const account = this.keyring.addFromUri(privateKey);
      
      // Get account info
      const { nonce } = await this.api.query.system.account(account.address);
      
      // Create transfer transaction
      const transfer = this.api.tx.balances.transfer(recipientAddress, amount);
      
      // Sign and send transaction
      const hash = await transfer.signAndSend(account, { nonce });
      
      // Wait for transaction to be included in block
      const { blockNumber } = await this.api.rpc.chain.getBlock(hash);
      
      return {
        hash: hash.toString(),
        blockNumber: blockNumber.toNumber(),
        explorerUrl: `https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.polkadot.io#/explorer/query/${hash.toString()}`,
        success: true
      };
    } catch (error: any) {
      console.error('Transaction failed:', error);
      return {
        hash: '',
        blockNumber: 0,
        explorerUrl: '',
        success: false,
        error: error.message
      };
    }
  }

  async createKnowledgeAsset(
    privateKey: string,
    title: string,
    description: string,
    content: string,
    tags: string[]
  ): Promise<TransactionResult> {
    if (!this.api || !this.keyring) {
      throw new Error('Polkadot service not initialized');
    }

    try {
      // Add account from private key
      const account = this.keyring.addFromUri(privateKey);
      
      // Get account info
      const { nonce } = await this.api.query.system.account(account.address);
      
      // Create custom transaction for Knowledge Asset
      // This would be a custom pallet call in the actual NeuroWeb implementation
      const metadata = {
        title,
        description,
        content,
        tags,
        timestamp: Date.now(),
        author: account.address
      };
      
      // For now, we'll create a remark transaction with the metadata
      const remark = this.api.tx.system.remark(JSON.stringify(metadata));
      
      // Sign and send transaction
      const hash = await remark.signAndSend(account, { nonce });
      
      // Wait for transaction to be included in block
      const { blockNumber } = await this.api.rpc.chain.getBlock(hash);
      
      return {
        hash: hash.toString(),
        blockNumber: blockNumber.toNumber(),
        explorerUrl: `https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.polkadot.io#/explorer/query/${hash.toString()}`,
        success: true
      };
    } catch (error: any) {
      console.error('Knowledge Asset creation failed:', error);
      return {
        hash: '',
        blockNumber: 0,
        explorerUrl: '',
        success: false,
        error: error.message
      };
    }
  }

  async getAccountBalance(address: string): Promise<string> {
    if (!this.api) {
      throw new Error('Polkadot service not initialized');
    }

    try {
      const { data: balance } = await this.api.query.system.account(address);
      return balance.free.toString();
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return '0';
    }
  }

  isServiceConnected(): boolean {
    return this.isConnected;
  }

  async disconnect() {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
      this.isConnected = false;
    }
  }
}

export const polkadotService = new PolkadotService();