import { config, isDevelopment } from './env';

// Example 1: Using API configuration
export const fetchUserData = async (userId: string) => {
  const response = await fetch(`${config.apiBaseUrl}/users/${userId}`);
  return response.json();
};

// Example 2: Using Web3 configuration
export const connectToWeb3 = async () => {
  if (window.ethereum) {
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

// Example 3: Environment-specific behavior
export const logDebugInfo = (message: string) => {
  if (isDevelopment) {
    console.log('[DEBUG]', message);
  }
};

// Example 4: Getting transaction explorer URL
export const getTransactionUrl = (txHash: string) => {
  return `${config.web3.explorerUrl}/tx/${txHash}`;
};

// Example 5: Getting address explorer URL
export const getAddressUrl = (address: string) => {
  return `${config.web3.explorerUrl}/address/${address}`;
};
