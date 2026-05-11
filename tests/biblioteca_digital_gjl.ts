import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { strict as assert } from "assert";

describe("biblioteca_digital_gjl", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.BibliotecaDigitalGjl as Program;
  const user = Keypair.generate();
  let userAccount: PublicKey;
  let tokenMint: PublicKey;
  let userTokenAccount: PublicKey;
  let mintAuthority: PublicKey;

  it("Inicializa perfil do aluno", async () => {
    await provider.connection.requestAirdrop(user.publicKey, 2 * LAMPORTS_PER_SOL);

    [userAccount] = await PublicKey.findProgramAddress(
      [Buffer.from("user_account"), user.publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .initializeUser()
      .accounts({
        userAccount,
        user: user.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    console.log("Perfil inicializado:", tx);
  });

  it("Registra leitura e emite tokens", async () => {
    [mintAuthority] = await PublicKey.findProgramAddress(
      [Buffer.from("mint_authority")],
      program.programId
    );

    tokenMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      mintAuthority,
      null,
      0
    );

    const userAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      tokenMint,
      user.publicKey
    );
    userTokenAccount = userAta.address;

    const isbn = "978-8564019114";

    const tx = await program.methods
      .registerReading(isbn)
      .accounts({
        userAccount,
        userTokenAccount,
        user: user.publicKey,
        tokenMint,
        mintAuthority,
        tokenProgram: anchor.SPL_TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    console.log("Leitura registrada:", tx);
  });

  it("Bloqueia registro apos atingir limite maximo de livros", async () => {
    const maxBooks = 50;
    const secondUser = Keypair.generate();

    await provider.connection.requestAirdrop(secondUser.publicKey, 2 * LAMPORTS_PER_SOL);

    const [secondUserAccount] = await PublicKey.findProgramAddress(
      [Buffer.from("user_account"), secondUser.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .initializeUser()
      .accounts({
        userAccount: secondUserAccount,
        user: secondUser.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([secondUser])
      .rpc();

    const secondUserAta = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      provider.wallet.payer,
      tokenMint,
      secondUser.publicKey
    );

    for (let i = 0; i < maxBooks; i++) {
      await program.methods
        .registerReading(`isbn-max-${i}`)
        .accounts({
          userAccount: secondUserAccount,
          userTokenAccount: secondUserAta.address,
          user: secondUser.publicKey,
          tokenMint,
          mintAuthority,
          tokenProgram: anchor.SPL_TOKEN_PROGRAM_ID,
        })
        .signers([secondUser])
        .rpc();
    }

    let raisedMaxBooksError = false;
    try {
      await program.methods
        .registerReading("isbn-max-overflow")
        .accounts({
          userAccount: secondUserAccount,
          userTokenAccount: secondUserAta.address,
          user: secondUser.publicKey,
          tokenMint,
          mintAuthority,
          tokenProgram: anchor.SPL_TOKEN_PROGRAM_ID,
        })
        .signers([secondUser])
        .rpc();
    } catch (error: any) {
      const msg = error?.error?.errorMessage ?? String(error);
      raisedMaxBooksError = /limite de livros|MaxBooksReached/i.test(msg);
    }

    assert.equal(raisedMaxBooksError, true, "Deveria falhar com MaxBooksReached no livro 51");
  });
});
