import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const endpoint = 'https://api.devnet.solana.com';

export function WalletAdapterProvider({ children }: { children: React.ReactNode }) {
  const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}


