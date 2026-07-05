declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    API_BASE_URL: string;
    WEB3_CHAIN_ID: string;
    WEB3_RPC_URL: string;
    WEB3_CHAIN_NAME: string;
    WEB3_EXPLORER_URL: string;
  }
}

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    isMetaMask?: boolean;
  };
}
