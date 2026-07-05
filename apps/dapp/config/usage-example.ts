import { config, isDevelopment } from './env';

// Example 1: Using API configuration (Server Component)
export const fetchUserDataServer = async (userId: string) => {
  const response = await fetch(`${config.apiBaseUrl}/users/${userId}`, {
    cache: 'no-store', // or 'force-cache' for SSG
  });
  return response.json();
};

// Example 2: Using API configuration (Client Component)
export const fetchUserDataClient = async (userId: string) => {
  const response = await fetch(`${config.apiBaseUrl}/users/${userId}`);
  return response.json();
};

// Example 3: Using Web3 configuration (Client Component)
export const connectToWeb3 = async () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${config.web3.chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  }
};

// Example 4: Environment-specific behavior
export const logDebugInfo = (message: string) => {
  if (isDevelopment) {
    console.log('[DEBUG]', message);
  }
};

// Example 5: Getting transaction explorer URL
export const getTransactionUrl = (txHash: string) => {
  return `${config.web3.explorerUrl}/tx/${txHash}`;
};

// Example 6: Getting address explorer URL
export const getAddressUrl = (address: string) => {
  return `${config.web3.explorerUrl}/address/${address}`;
};
