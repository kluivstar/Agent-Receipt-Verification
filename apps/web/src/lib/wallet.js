/**
 * Real Web3 Wallet Integration for AgentReceipt
 * Adheres to EIP-1193 standard (MetaMask, Rabby, Coinbase Wallet, Brave, etc.)
 */

export const GENLAYER_STUDIONET_PARAMS = {
  chainId: '0xF22F', // 61999
  chainName: 'GenLayer Studio Network',
  nativeCurrency: {
    name: 'GEN Token',
    symbol: 'GEN',
    decimals: 18
  },
  rpcUrls: ['https://studio.genlayer.com/api'],
  blockExplorerUrls: ['https://genlayer-explorer.vercel.app']
};

export const walletService = {
  hasInjectedWallet() {
    return typeof window !== 'undefined' && Boolean(window.ethereum);
  },

  getInjectedProvider() {
    if (typeof window === 'undefined') return null;
    return window.ethereum || null;
  },

  async connectInjectedWallet() {
    const provider = this.getInjectedProvider();
    if (!provider) {
      throw new Error(
        'No Web3 wallet extension found. Please install MetaMask, Rabby, or another browser wallet.'
      );
    }

    try {
      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts selected in wallet.');
      }

      const chainIdHex = await provider.request({
        method: 'eth_chainId'
      });
      const chainId = parseInt(chainIdHex, 16);

      return {
        address: accounts[0],
        chainId,
        isSimulated: false
      };
    } catch (err) {
      if (err.code === 4001) {
        throw new Error('Connection request rejected by user.');
      }
      throw new Error(err.message || 'Failed to connect wallet.');
    }
  },

  async switchOrAddGenLayerNetwork() {
    const provider = this.getInjectedProvider();
    if (!provider) {
      throw new Error('No Web3 wallet extension detected.');
    }

    try {
      // Try to switch to GenLayer StudioNet
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: GENLAYER_STUDIONET_PARAMS.chainId }]
      });
      return true;
    } catch (switchError) {
      // Error code 4902 indicates that the chain has not been added to the wallet yet
      if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [GENLAYER_STUDIONET_PARAMS]
          });
          return true;
        } catch (addError) {
          throw new Error('Failed to add GenLayer StudioNet to wallet: ' + addError.message);
        }
      }
      throw switchError;
    }
  },

  subscribeToEvents({ onAccountsChanged, onChainChanged }) {
    const provider = this.getInjectedProvider();
    if (!provider || !provider.on) return () => {};

    const handleAccounts = (accounts) => {
      if (onAccountsChanged) {
        onAccountsChanged(accounts.length > 0 ? accounts[0] : null);
      }
    };

    const handleChain = (chainIdHex) => {
      if (onChainChanged) {
        onChainChanged(parseInt(chainIdHex, 16));
      }
    };

    provider.on('accountsChanged', handleAccounts);
    provider.on('chainChanged', handleChain);

    return () => {
      if (provider.removeListener) {
        provider.removeListener('accountsChanged', handleAccounts);
        provider.removeListener('chainChanged', handleChain);
      }
    };
  }
};
