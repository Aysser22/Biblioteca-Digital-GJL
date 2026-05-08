/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly VITE_PROGRAM_ID: string;
    readonly VITE_MINT_ADDRESS: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};