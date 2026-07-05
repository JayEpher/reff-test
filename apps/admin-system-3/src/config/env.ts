export interface Web3Config {
  chainId: number;
  rpcUrl: string;
  chainName: string;
  explorerUrl: string;
}

export interface AppConfig {
  env: string;
  apiBaseUrl: string;
  web3: Web3Config;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

export const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  apiBaseUrl: getEnvVar('API_BASE_URL'),
  web3: {
    chainId: parseInt(getEnvVar('WEB3_CHAIN_ID'), 10),
    rpcUrl: getEnvVar('WEB3_RPC_URL'),
    chainName: getEnvVar('WEB3_CHAIN_NAME'),
    explorerUrl: getEnvVar('WEB3_EXPLORER_URL'),
  },
};

export const isDevelopment = config.env === 'development';
export const isProduction = config.env === 'production';
export const isTest = config.env === 'test';
