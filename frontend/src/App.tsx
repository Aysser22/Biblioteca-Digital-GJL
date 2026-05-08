import { useCallback, useEffect, useMemo, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL } from "./idl";

const PROGRAM_ID = new PublicKey("Biblibrary11111111111111111111111111111111111");
const DEFAULT_MINT = "ReplaceWithYourMintAddressHere";

type UserAccountData = {
  owner: string;
  xp: number;
  level: number;
  totalTokens: number;
  booksRead: string[];
};

function App() {
  const wallet = useWallet();
  const connection = useMemo(
    () => new web3.Connection(clusterApiUrl("devnet"), "processed"),
    []
  );

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) return null;
    return new AnchorProvider(connection, wallet as any, {
      preflightCommitment: "processed",
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL as any, PROGRAM_ID, provider);
  }, [provider]);

  const [userAccount, setUserAccount] = useState<UserAccountData | null>(null);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [isbn, setIsbn] = useState("");
  const [mintAddress, setMintAddress] = useState(DEFAULT_MINT);
  const [status, setStatus] = useState("Conecte a wallet para carregar o perfil.");
  const [userPda, setUserPda] = useState<PublicKey | null>(null);
  const [mintAuthority, setMintAuthority] = useState<PublicKey | null>(null);

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
      const [pda] = await PublicKey.findProgramAddress(
        [Buffer.from("user_account"), wallet.publicKey!.toBuffer()],
        PROGRAM_ID
      );
      const [mintPda] = await PublicKey.findProgramAddress(
        [Buffer.from("mint_authority")],
        PROGRAM_ID
      );
      setUserPda(pda);
      setMintAuthority(mintPda);
    })();
  }, [wallet.publicKey]);

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
      <header>
        <h1>Biblioteca Digital GJL</h1>
        <p>Read-to-Earn na Solana Devnet</p>
      </header>

      <div className="wallet-bar">
        <WalletMultiButton />
      </div>

      <div className="card">
        <h2>Status</h2>
        <p>{status}</p>
      </div>

      <div className="card">
        <h2>Configuração</h2>
        <label>
          Endereço do Token SPL (READ):
          <input
            type="text"
            value={mintAddress}
            onChange={(event) => setMintAddress(event.target.value)}
            placeholder="Ex: 8V..."
          />
        </label>
      </div>

      <div className="card grid-two">
        <div>
          <h2>Perfil do Aluno</h2>
          {userAccount ? (
            <div className="profile-data">
              <p><strong>XP:</strong> {userAccount.xp}</p>
              <p><strong>Nível:</strong> {userAccount.level}</p>
              <p><strong>Tokens acumulados:</strong> {userAccount.totalTokens}</p>
              <p><strong>Livros lidos:</strong> {userAccount.booksRead.length}</p>
              <pre>{JSON.stringify(userAccount.booksRead, null, 2)}</pre>
            </div>
          ) : (
            <p>Nenhum perfil carregado.</p>
          )}
        </div>

        <div>
          <h2>Saldo de Tokens</h2>
          <p>{tokenBalance}</p>
        </div>
      </div>

      <div className="card">
        <h2>Ação de Leitura</h2>
        <label>
          ISBN do livro:
          <input
            type="text"
            value={isbn}
            onChange={(event) => setIsbn(event.target.value)}
            placeholder="978-..."
          />
        </label>
        <div className="button-row">
          <button onClick={initializeUser} disabled={!wallet.connected}>
            Criar Perfil
          </button>
          <button onClick={registerReading} disabled={!wallet.connected}>
            Registrar Leitura
          </button>
          <button onClick={loadProfile} disabled={!wallet.connected}>
            Atualizar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
