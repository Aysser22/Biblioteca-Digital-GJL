import React, { useEffect, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { ThemeMode, applyThemeMode, getInitialThemeMode } from '../theme';
import { useMetaMaskWallet } from '../evm/MetaMaskWallet';

function ThemeToggleButton() {
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    const initial = getInitialThemeMode();
    setMode(initial);
    applyThemeMode(initial);
  }, []);

  const toggle = () => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      applyThemeMode(next);
      return next;
    });
  };

  const label = mode === 'dark' ? 'Modo escuro' : 'Modo claro';
  const icon = mode === 'dark' ? '🌙' : '☀️';

  return (
    <button className="themeToggle" type="button" onClick={toggle} aria-label={label}>
      <span className="themeToggleIcon" aria-hidden="true">{icon}</span>
      <span className="themeToggleText">Trocar</span>
    </button>
  );
}

function shortAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function seededNumber(seedStr: string, mod: number) {
  // simples: gera um número estável a partir do endereço (mock)
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = (h * 31 + seedStr.charCodeAt(i)) % 1000000007;
  }
  return h % mod;
}

export default function ProfilePage() {
  const { publicKey, connected: solConnected, connect: solConnect, disconnect: solDisconnect } =
    useWallet();
  const solAddress = publicKey?.toBase58() ?? '';

  const [showWalletChooser, setShowWalletChooser] = useState(false);

  const {
    address: evmAddress,
    status: evmStatus,
    error: evmError,
    connect: evmConnect,
    disconnect: evmDisconnect,
    shortAddress: evmShortAddress,
  } = useMetaMaskWallet();

  const evmConnected = evmStatus === 'connected';

  // Para o mock do perfil/estatísticas: preferimos Solana se estiver conectada, senão EVM.
  const activeAddress = solConnected ? solAddress : evmConnected ? evmAddress : '';

  const [stats, setStats] = useState<{
    booksReadCount: number;
    streak: number;
    favBooks: number;
    booksRead: string[];
    booksToRead: string[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!activeAddress) {
        setStats(null);
        return;
      }

      const { fetchStats } = await import('../lib/statsApi');
      try {
        const s = await fetchStats(activeAddress);
        if (!cancelled) setStats(s);
      } catch {
        if (!cancelled) setStats({ booksReadCount: 0, streak: 0, favBooks: 0, booksRead: [], booksToRead: [] });
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [activeAddress]);


  const [localName, setLocalName] = useState('');
  useEffect(() => {
    if (!activeAddress) {
      setLocalName('');
      return;
    }
    const n = seededNumber(activeAddress, 999);
    setLocalName(`Aluno ${n}`);
  }, [activeAddress]);

  const authBaseUrl = import.meta.env.VITE_AUTH_BASE_URL ?? 'http://localhost:4000';

  const showAnyConnected = solConnected || evmConnected;



  return (

    <div className="page">
      <header className="topbar">
        <Link className="brandLink" to="/">
          ← Biblioteca Digital
        </Link>
        <Link className="topLink" to="/explorar">
          Explorar
        </Link>
      </header>

      <main className="content">
        <h2>Perfil</h2>

        <section className="profileCard">
          <div className="profileRow">
            <div className="avatar">👤</div>
              <div style={{ flex: 1 }}>
              <div className="profileName">
                {showAnyConnected ? localName : 'Conecte sua carteira'}


              </div>

              <div className="profileSub">
                {solConnected ? (
                  <span>
                    Endereço (Solana): <b>{shortAddress(solAddress)}</b>
                  </span>
                ) : evmConnected ? (
                  <span>
                    Endereço (EVM): <b>{evmShortAddress}</b>
                  </span>
                ) : (
                  <span>Conecte Phantom ou MetaMask.</span>
                )}
              </div>

            </div>


            <ThemeToggleButton />
          </div>

          <div className="row">
            {!showAnyConnected && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button className="btn" type="button" onClick={() => setShowWalletChooser(true)}>
                  Login com carteira
                </button>
              </div>
            )}




            {showAnyConnected && (
              <button
                className="btn btnGhost"
                type="button"
                onClick={async () => {
                  if (solConnected) solDisconnect();
                  if (evmConnected) evmDisconnect();
                }}

              >
                Desconectar
              </button>

            )}
          </div>

          {!showAnyConnected && showWalletChooser && (
            <div
              className="walletChooserOverlay"
              role="dialog"
              aria-modal="true"
              aria-label="Escolher carteira para login"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setShowWalletChooser(false);
              }}
            >
              <div className="walletChooserModal">
                <div className="walletChooserHeader">
                  <div className="walletChooserTitle">Escolha sua carteira</div>
                  <button
                    className="walletChooserClose"
                    type="button"
                    onClick={() => setShowWalletChooser(false)}
                    aria-label="Fechar"
                  >
                    ✕
                  </button>
                </div>

                <div className="walletChooserBody">
                    <button
                      type="button"
                      className="walletOption"
                      onClick={() => {
                        setShowWalletChooser(false);
                        solConnect();
                      }}
                    >
                      <div className="walletOptionLeft">
                        <div className="walletIcon">👻</div>

                        <div>
                          <div className="walletOptionTitle">Solana (Phantom)</div>
                          <div className="walletOptionDesc">Conecta via Phantom.</div>
                        </div>
                      </div>
                      <div className="walletChip">Phantom</div>
                    </button>


                  <button
                    type="button"
                    className="walletOption"
                    onClick={() => {
                      setShowWalletChooser(false);
                      evmConnect();
                    }}
                  >
                    <div className="walletOptionLeft">
                      <div className="walletIcon">🦊</div>

                      <div>
                        <div className="walletOptionTitle">EVM (MetaMask)</div>
                        <div className="walletOptionDesc">Conecta via MetaMask (EVM).</div>
                      </div>
                    </div>
                    <div className="walletChip">EVM</div>
                  </button>

                  <div className="walletChooserFooter">
                    Dica: ao escolher, o navegador pode pedir permissão para conectar.
                  </div>

                  {evmError && <div className="walletError">{evmError}</div>}
                </div>
              </div>
            </div>
          )}

          {showAnyConnected && <div className="divider" />}

            {showAnyConnected && stats && (
            <div className="statsGrid">
              <div className="stat">
                <div className="statValue">{stats.booksReadCount}</div>
                <div className="statLabel">livros lidos</div>
              </div>
              <div className="stat">
                <div className="statValue">{stats.streak}</div>
                <div className="statLabel">sequência (dias)</div>
              </div>
              <div className="stat">
                <div className="statValue">{stats.favBooks}</div>
                <div className="statLabel">favoritos</div>
              </div>
            </div>
          )}


          <div className="muted">
            {showAnyConnected ? (
              <>
                Observação: as estatísticas são <b>mock</b> agora, mas o endereço vem da sua
                carteira {solConnected ? 'Solana' : 'EVM'}.
              </>
            ) : (
              <>Conecte para ver seu perfil e estatísticas.</>
            )}
          </div>
        </section>

        <section className="readingStatsSection">
          <div className="sectionHeader">
            <div>
              <div className="sectionTitle">Estatísticas de leitura</div>
              <div className="sectionSubtitle">Mock por enquanto (os números mudam pelo endereço conectado).</div>
            </div>
            {showAnyConnected && stats && (
              <div className="progressPill" aria-label="Progresso mock">
                <span className="progressPillLabel">Progresso</span>
                <span className="progressPillValue">
                  {Math.min(100, Math.round((stats.booksReadCount / (stats.booksReadCount + stats.favBooks + 10)) * 100))}%
                </span>


              </div>
            )}
          </div>

          {showAnyConnected && stats && (
            <div className="statsGrid statsGridBig">
              <div className="stat statElevated">
                <div className="statValue">{stats.booksReadCount}</div>
                <div className="statLabel">livros lidos</div>
                <div className="statHint">Meta do mês: +{1 + (stats.booksReadCount % 3)}</div>
              </div>

              <div className="stat statElevated">
                <div className="statValue">{stats.streak}</div>
                <div className="statLabel">sequência (dias)</div>
                <div className="statHint">Continue! Isso conta muito.</div>
              </div>
              <div className="stat statElevated">
                <div className="statValue">{stats.favBooks}</div>
                <div className="statLabel">favoritos</div>
                <div className="statHint">Seus favoritos mais marcados.</div>
              </div>
            </div>
          )}

          {!showAnyConnected && <div className="muted">Conecte para ver suas estatísticas.</div>}
        </section>


      </main>
    </div>
  );
}

