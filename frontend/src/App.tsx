import { useCallback, useEffect, useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL } from "./idl";

const ENV_PROGRAM_ID = import.meta.env.VITE_PROGRAM_ID;
const ENV_MINT_ADDRESS = import.meta.env.VITE_MINT_ADDRESS;
const DEFAULT_PROGRAM_ID = "Biblibrary11111111111111111111111111111111111";
const DEFAULT_MINT = "ReplaceWithYourMintAddressHere";

type UserAccountData = {
  owner: string;
  xp: number;
  level: number;
  totalTokens: number;
  booksRead: string[];
};

type FeaturedBook = {
  title: string;
  author: string;
  rating: string;
  tags: string[];
};

const featuredBooks: FeaturedBook[] = [
  {
    title: "1984",
    author: "George Orwell",
    rating: "4.8",
    tags: ["Distopia", "Clássico", "Suspense"],
  },
  {
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    rating: "4.7",
    tags: ["Infantil", "Filosofia", "Poético"],
  },
  {
    title: "Orgulho e Preconceito",
    author: "Jane Austen",
    rating: "4.6",
    tags: ["Romance", "Clássico", "Sociedade"],
  },
];

function App() {
  const wallet = useWallet();
  const connection = useMemo(
    () => new web3.Connection(clusterApiUrl("devnet"), "processed"),
    []
  );

  const [userAccount, setUserAccount] = useState<UserAccountData | null>(null);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [isbn, setIsbn] = useState("");
  const [programIdString, setProgramIdString] = useState(ENV_PROGRAM_ID ?? DEFAULT_PROGRAM_ID);
  const [mintAddress, setMintAddress] = useState(ENV_MINT_ADDRESS ?? DEFAULT_MINT);
  const [status, setStatus] = useState("Conecte a wallet para carregar o perfil.");
  const [userPda, setUserPda] = useState<PublicKey | null>(null);
  const [mintAuthority, setMintAuthority] = useState<PublicKey | null>(null);

  const programPublicKey = useMemo(() => {
    try {
      return new PublicKey(programIdString);
    } catch {
      return null;
    }
  }, [programIdString]);

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;
    return new AnchorProvider(connection, wallet as any, {
      preflightCommitment: "processed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider || !programPublicKey) return null;
    return new Program(IDL as any, programPublicKey, provider);
  }, [provider, programPublicKey]);

  useEffect(() => {
    if (!wallet.publicKey) {
      setUserPda(null);
      setMintAuthority(null);
      setUserAccount(null);
      setTokenBalance("0");
      setStatus("Conecte a wallet para carregar o perfil.");
      return;
    }

    (async () => {
      if (!programPublicKey) {
        setStatus("Program ID inválido. Atualize a configuração do programa.");
        setUserPda(null);
        setMintAuthority(null);
        return;
      }

      const [pda] = await PublicKey.findProgramAddress(
        [Buffer.from("user_account"), wallet.publicKey!.toBuffer()],
        programPublicKey
      );
      const [mintPda] = await PublicKey.findProgramAddress(
        [Buffer.from("mint_authority")],
        programPublicKey
      );
      setUserPda(pda);
      setMintAuthority(mintPda);
    })();
  }, [wallet.publicKey, programPublicKey]);

  const loadProfile = useCallback(async () => {
    if (!program || !userPda || !wallet.publicKey) return;
    setStatus("Carregando perfil...");

    try {
      const account = await program.account.userAccount.fetch(userPda);
      const raw = account as any;
      const profile: UserAccountData = {
        owner: raw.owner.toBase58(),
        xp: raw.xp?.toNumber ? raw.xp.toNumber() : Number(raw.xp),
        level: Number(raw.level),
        totalTokens: raw.totalTokens?.toNumber ? raw.totalTokens.toNumber() : Number(raw.totalTokens),
        booksRead: raw.booksRead ?? [],
      };
      setUserAccount(profile);
      setStatus("Perfil carregado com sucesso.");

      if (mintAddress && mintAddress !== DEFAULT_MINT) {
        const mintPublicKey = new PublicKey(mintAddress);
        const ata = await getAssociatedTokenAddress(mintPublicKey, wallet.publicKey);
        try {
          const accountInfo = await getAccount(connection, ata);
          setTokenBalance(accountInfo.amount.toString());
        } catch {
          setTokenBalance("0");
        }
      }
    } catch (error) {
      setStatus("Conta de usuário não encontrada. Crie seu perfil primeiro.");
      setUserAccount(null);
      setTokenBalance("0");
    }
  }, [program, userPda, wallet.publicKey, connection, mintAddress]);

  const initializeUser = useCallback(async () => {
    if (!program || !userPda || !wallet.publicKey) return;
    setStatus("Inicializando perfil...");

    try {
      await program.methods
        .initializeUser()
        .accounts({
          userAccount: userPda,
          user: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setStatus("Perfil criado com sucesso.");
      await loadProfile();
    } catch (error) {
      console.error(error);
      setStatus("Falha ao criar perfil. Verifique a console.");
    }
  }, [program, userPda, wallet.publicKey, loadProfile]);

  const registerReading = useCallback(async () => {
    if (!program || !userPda || !wallet.publicKey || !mintAuthority) return;
    if (!isbn) {
      setStatus("Digite o ISBN antes de registrar a leitura.");
      return;
    }
    if (!mintAddress || mintAddress === DEFAULT_MINT) {
      setStatus("Informe o endereço do token SPL a ser usado para a recompensa.");
      return;
    }

    setStatus("Registrando leitura...");

    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const userAta = await getAssociatedTokenAddress(mintPublicKey, wallet.publicKey);

      await program.methods
        .registerReading(isbn)
        .accounts({
          userAccount: userPda,
          userTokenAccount: userAta,
          user: wallet.publicKey,
          tokenMint: mintPublicKey,
          mintAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();

      setStatus("Leitura registrada! Atualizando perfil...");
      await loadProfile();
    } catch (error) {
      console.error(error);
      setStatus("Erro ao registrar leitura. Veja a console para mais detalhes.");
    }
  }, [program, userPda, wallet.publicKey, isbn, mintAddress, mintAuthority, loadProfile]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div>
          <span className="brand">Biblioteca GJL</span>
          <p className="brand-subtitle">Clube de leitura gamificado</p>
        </div>
        <nav className="top-nav">
          <a href="#destaques">Destaques</a>
          <a href="#perfil">Perfil</a>
          <a href="#leitura">Registrar</a>
        </nav>
        <div className="wallet-bar">
          <WalletMultiButton />
        </div>
      </header>

      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Inspirado em sites famosos de leitura</span>
          <h1>Descubra, leia e ganhe prêmios com cada livro.</h1>
          <p>
            Um frontend inspirado em Goodreads e bibliotecas modernas, com um visual limpo e foco em suas leituras.
          </p>
          <div className="hero-actions">
            <button onClick={loadProfile} disabled={!wallet.connected}>
              Ver meu perfil
            </button>
            <button className="secondary" onClick={initializeUser} disabled={!wallet.connected}>
              Criar perfil
            </button>
          </div>
        </div>

        <div className="hero-card">
          <div className="book-highlight">
            <strong>Livro do mês</strong>
            <h2>O Pequeno Príncipe</h2>
            <p>Uma jornada leve e profunda para leitores de todas as idades.</p>
            <div className="badge-row">
              <span>4.7</span>
              <span>Filosofia</span>
              <span>Clássico</span>
            </div>
          </div>
        </div>
      </section>

      <section className="status-grid" id="perfil">
        <article className="status-card">
          <h3>XP</h3>
          <p>{userAccount ? userAccount.xp : 0}</p>
        </article>
        <article className="status-card">
          <h3>Nível</h3>
          <p>{userAccount ? userAccount.level : 1}</p>
        </article>
        <article className="status-card">
          <h3>Tokens</h3>
          <p>{tokenBalance}</p>
        </article>
        <article className="status-card">
          <h3>Livros lidos</h3>
          <p>{userAccount ? userAccount.booksRead.length : 0}</p>
        </article>
      </section>

      <div className="content-grid">
        <main>
          <section className="section-panel" id="destaques">
            <div className="section-header">
              <div>
                <h2>Destaques</h2>
                <p>Livros selecionados para inspirar sua próxima leitura.</p>
              </div>
            </div>

            <div className="book-grid">
              {featuredBooks.map((book) => (
                <article className="book-card" key={book.title}>
                  <div className="cover-placeholder" />
                  <div className="book-info">
                    <h3>{book.title}</h3>
                    <p>{book.author}</p>
                    <div className="tag-row">
                      {book.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="rating">⭐ {book.rating}</div>
                </article>
              ))}
            </div>
          </section>

          <section className="section-panel" id="leitura">
            <div className="section-header">
              <div>
                <h2>Registrar leitura</h2>
                <p>Insira o ISBN do livro para atualizar seu progresso.</p>
              </div>
            </div>

            <div className="card form-card">
              <label>
                ISBN do livro
                <input
                  type="text"
                  value={isbn}
                  onChange={(event) => setIsbn(event.target.value)}
                  placeholder="978-..."
                />
              </label>
              <div className="button-row">
                <button onClick={registerReading} disabled={!wallet.connected}>
                  Registrar Leitura
                </button>
                <button onClick={loadProfile} disabled={!wallet.connected}>
                  Atualizar Perfil
                </button>
              </div>
              <p className="help-text">Após registrar, seu perfil e saldo serão atualizados.</p>
            </div>
          </section>
        </main>

        <aside className="sidebar-panel">
          <div className="card sidebar-card">
            <h2>Configurações</h2>
            <label>
              Program ID
              <input
                type="text"
                value={programIdString}
                onChange={(event) => setProgramIdString(event.target.value)}
                placeholder="Insira o programa Anchor"
              />
            </label>
            <label>
              Endereço do Token READ
              <input
                type="text"
                value={mintAddress}
                onChange={(event) => setMintAddress(event.target.value)}
                placeholder="Ex: 8V..."
              />
            </label>
          </div>

          <div className="card sidebar-card">
            <h2>Status</h2>
            <p>{status}</p>
          </div>

          <div className="card sidebar-card">
            <h2>Leituras recentes</h2>
            {userAccount && userAccount.booksRead.length > 0 ? (
              <ul className="reading-list">
                {userAccount.booksRead.slice(-5).map((book, index) => (
                  <li key={`${book}-${index}`}>{book}</li>
                ))}
              </ul>
            ) : (
              <p>Nenhum livro registrado ainda.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
