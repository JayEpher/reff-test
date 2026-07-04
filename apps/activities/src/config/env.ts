export interface Web3Config {
  chainId: number;
  rpcUrl: string;
  chainName: string;
  explorerUrl: string;
}

export interface AppConfig {
  env: 'development' | 'test' | 'production';
  apiBaseUrl: string;
  web3: Web3Config;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

export const config: AppConfig = {
  env: import.meta.env.VITE_ENV || 'development',
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL'),
  web3: {
    chainId: parseInt(getEnvVar('VITE_WEB3_CHAIN_ID'), 10),
    rpcUrl: getEnvVar('VITE_WEB3_RPC_URL'),
    chainName: getEnvVar('VITE_WEB3_CHAIN_NAME'),
    explorerUrl: getEnvVar('VITE_WEB3_EXPLORER_URL'),
  },
};

export const isDevelopment = config.env === 'development';
export const isTest = config.env === 'test';
export const isProduction = config.env === 'production';
