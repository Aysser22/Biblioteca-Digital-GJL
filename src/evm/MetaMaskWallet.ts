import { useEffect, useMemo, useState } from 'react';
import { BrowserProvider } from 'ethers';


declare global {
  interface Window {
    // Alguns tipos de wallet/provedores mudam conforme lib; pra evitar atrito, usamos any.
    ethereum?: any;
  }
}

type MetaMaskAccount = {
  address: string;
};

function getEthereum(): any {
  return window.ethereum;
}


function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function useMetaMaskWallet() {
  const [account, setAccount] = useState<MetaMaskAccount | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [error, setError] = useState<string>('');

  const hasProvider = useMemo(() => !!getEthereum(), []);

  useEffect(() => {
    // persistência automática: tenta restaurar via eth_accounts
    const restore = async () => {
      if (!hasProvider) return;

      try {
        const eth = getEthereum();
        if (!eth?.request) return;

        const accounts: string[] = await eth.request({ method: 'eth_accounts' });
        if (accounts?.[0]) {
          setAccount({ address: accounts[0] });
          setStatus('connected');
        }
      } catch {
        // ignora e mantém estado desconectado
      }
    };

    restore();
  }, [hasProvider]);


  useEffect(() => {
    if (!hasProvider) return;
    const eth = getEthereum();
    if (!eth) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts?.[0]) {
        setAccount({ address: accounts[0] });
        setStatus('connected');
      } else {
        setAccount(null);
        setStatus('disconnected');
      }
    };

    const handleChainChanged = () => {
      // não precisamos tratar agora, mas mantemos o hook pronto
    };

    // EIP-1193 events
    eth.on?.('accountsChanged', handleAccountsChanged);
    eth.on?.('chainChanged', handleChainChanged);

    return () => {
      eth.removeListener?.('accountsChanged', handleAccountsChanged);
      eth.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [hasProvider]);

  const connect = async () => {
    if (!hasProvider) {
      setError('MetaMask não encontrado. Instale/ative uma carteira EVM compatível.');
      setStatus('error');
      return;
    }

    try {
      setError('');
      setStatus('connecting');

      const eth = getEthereum();
      if (!eth) throw new Error('window.ethereum indefinido');

      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (!accounts?.[0]) throw new Error('Nenhuma conta retornada');

      setAccount({ address: accounts[0] });
      setStatus('connected');
    } catch (e: any) {
      setError(e?.message ?? 'Falha ao conectar MetaMask');
      setStatus('error');
    }
  };

  const disconnect = () => {
    // MetaMask não oferece desconectar padrão via API.
    // Limpamos apenas estado local.
    setAccount(null);
    setStatus('disconnected');
  };

  return {
    hasProvider,
    account,
    address: account?.address ?? '',
    shortAddress: account?.address ? shortAddress(account.address) : '',
    status,
    error,
    connect,
    disconnect,
  };
}

