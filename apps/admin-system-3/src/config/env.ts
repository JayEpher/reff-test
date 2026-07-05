export interface AppConfig {
  env: string;
  apiBaseUrl: string;
  web3: {
    chainId: number;
    rpcUrl: string;
    chainName: string;
    explorerUrl: string;
  };
}

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.warn(`Environment variable ${key} is not defined`);
    return '';
  }
  return value;
}

export const config: AppConfig = {
  env: process.env.ENV || 'production',
  apiBaseUrl: getEnvVar('API_BASE_URL'),
  web3: {
    chainId: parseInt(getEnvVar('WEB3_CHAIN_ID'), 10) || 1,
    rpcUrl: getEnvVar('WEB3_RPC_URL'),
    chainName: getEnvVar('WEB3_CHAIN_NAME'),
    explorerUrl: getEnvVar('WEB3_EXPLORER_URL'),
  },
};

export default config;
