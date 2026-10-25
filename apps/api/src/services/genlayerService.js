import { createClient, createAccount, chains } from 'genlayer-js';
import { config } from '../config/index.js';

export class GenLayerService {
  constructor() {
    this.networkName = config.genlayer.network;
    this.chain = chains[this.networkName] || chains.studionet;
    this.contractAddress = config.genlayer.contractAddress;
    this.account = null;
    this.client = null;

    this._initializeClient();
  }

  _initializeClient() {
    try {
      if (config.genlayer.operatorPrivateKey) {
        this.account = createAccount(config.genlayer.operatorPrivateKey);
      }

      this.client = createClient({
        chain: this.chain,
        account: this.account || undefined,
      });
    } catch (err) {
      console.warn(`[GenLayerService] Notice: could not initialize live signer (${err.message}). Read-only and simulation mode enabled.`);
      this.client = createClient({
        chain: this.chain
      });
    }
  }

  isConfigured() {
    return (
      Boolean(this.contractAddress) &&
      this.contractAddress !== '0x0000000000000000000000000000000000000000' &&
      this.contractAddress.length === 42
    );
  }

  getNetworkStatus() {
    const explorerUrl = this.chain.blockExplorers?.default?.url || 'https://genlayer-explorer.vercel.app';
    const rpcUrl = this.chain.rpcUrls?.default?.http?.[0] || config.genlayer.rpcUrl;

    return {
      network: this.networkName,
      chainName: this.chain.name || this.networkName,
      chainId: this.chain.id,
      rpcUrl,
      explorerUrl,
      contractAddress: this.contractAddress,
      isConfigured: this.isConfigured(),
      appMode: config.appMode,
      hasSigner: Boolean(this.account)
    };
  }

  async readContractData({ functionName, args = [] }) {
    if (!this.isConfigured()) {
      throw new Error('GenLayer contract address is not configured. Set GENLAYER_CONTRACT_ADDRESS in .env.');
    }

    try {
      const data = await this.client.readContract({
        address: this.contractAddress,
        functionName,
        args
      });
      return { success: true, data };
    } catch (err) {
      return {
        success: false,
        error: this._normalizeError(err)
      };
    }
  }

  async evaluateDeliverable({ task, submission }) {
    if (!this.isConfigured()) {
      throw new Error('GenLayer contract address is not configured.');
    }

    if (!this.account) {
      throw new Error('Server operator private key not configured. For decentralized execution, connect a Web3 wallet from the frontend or configure GENLAYER_OPERATOR_PRIVATE_KEY.');
    }

    try {
      const args = [
        task.id,
        submission.id,
        submission.deliverableUrl || '',
        submission.deliverableContent || '',
        JSON.stringify(submission.evidenceUrls || [])
      ];

      // Estimate transaction fees / prepare write
      const writeParams = {
        address: this.contractAddress,
        functionName: 'evaluate_submission',
        args
      };

      let fees = undefined;
      if (typeof this.client.estimateTransactionFeesForWrite === 'function') {
        const est = await this.client.estimateTransactionFeesForWrite(writeParams);
        fees = {
          distribution: est.distribution,
          feeValue: est.feeValue
        };
      }

      const txHash = await this.client.writeContract({
        ...writeParams,
        ...(fees ? { fees } : {})
      });

      // Wait for consensus finalization
      let receipt = null;
      if (typeof this.client.waitForFinalization === 'function') {
        receipt = await this.client.waitForFinalization({ hash: txHash });
      } else if (typeof this.client.waitForTransactionReceipt === 'function') {
        receipt = await this.client.waitForTransactionReceipt({ hash: txHash });
      }

      // Read back state from contract
      const evalRead = await this.readContractData({
        functionName: 'get_evaluation',
        args: [submission.id]
      });

      return {
        success: true,
        transactionHash: txHash,
        receipt,
        evaluation: evalRead.success ? evalRead.data : null,
        contractAddress: this.contractAddress,
        network: this.networkName
      };
    } catch (err) {
      throw new Error(`GenLayer write failed: ${this._normalizeError(err)}`);
    }
  }

  async verifyOnChainReceipt({ contractAddress, transactionHash }) {
    if (!contractAddress || !transactionHash) {
      return {
        verified: false,
        reason: 'Missing contract address or transaction hash'
      };
    }

    if (transactionHash.startsWith('0xsim_')) {
      return {
        verified: false,
        isSimulated: true,
        reason: 'Simulated local demonstration transaction - not recorded on public consensus chain.'
      };
    }

    try {
      const tx = await this.client.getTransaction({ hash: transactionHash });
      if (!tx) {
        return {
          verified: false,
          reason: 'Transaction hash not found in network block state.'
        };
      }

      return {
        verified: true,
        transaction: {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          blockNumber: tx.blockNumber
        }
      };
    } catch (err) {
      return {
        verified: false,
        reason: `Network lookup error: ${this._normalizeError(err)}`
      };
    }
  }

  _normalizeError(err) {
    if (!err) return 'Unknown GenLayer error';
    if (typeof err === 'string') return err;
    if (err.shortMessage) return err.shortMessage;
    if (err.message) return err.message;
    return String(err);
  }
}

export const genlayerService = new GenLayerService();
