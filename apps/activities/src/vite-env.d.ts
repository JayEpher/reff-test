/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENV: 'development' | 'test' | 'production';
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WEB3_CHAIN_ID: string;
  readonly VITE_WEB3_RPC_URL: string;
  readonly VITE_WEB3_CHAIN_NAME: string;
  readonly VITE_WEB3_EXPLORER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    isMetaMask?: boolean;
  };
}
