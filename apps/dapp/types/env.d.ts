declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    NEXT_PUBLIC_API_BASE_URL: string;
    NEXT_PUBLIC_WEB3_CHAIN_ID: string;
    NEXT_PUBLIC_WEB3_RPC_URL: string;
    NEXT_PUBLIC_WEB3_CHAIN_NAME: string;
    NEXT_PUBLIC_WEB3_EXPLORER_URL: string;
  }
}

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    isMetaMask?: boolean;
  };
}
