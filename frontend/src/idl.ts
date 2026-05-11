export const IDL = {
  version: "0.1.0",
  name: "biblioteca_digital_gjl",
  instructions: [
    {
      name: "initializeUser",
      accounts: [
        { name: "userAccount", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "createBook",
      accounts: [
        { name: "bookAccount", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [
        { name: "isbn", type: "string" },
        { name: "title", type: "string" },
        { name: "ipfsHash", type: "string" },
      ],
    },
    {
      name: "registerReading",
      accounts: [
        { name: "userAccount", isMut: true, isSigner: false },
        { name: "userTokenAccount", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "tokenMint", isMut: true, isSigner: false },
        { name: "mintAuthority", isMut: false, isSigner: false },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "isbn", type: "string" }],
    },
  ],
  accounts: [
    {
      name: "UserAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "xp", type: "u64" },
          { name: "level", type: "u8" },
          { name: "totalTokens", type: "u64" },
          { name: "booksRead", type: { vec: "string" } },
        ],
      },
    },
    {
      name: "BookAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "isbn", type: "string" },
          { name: "title", type: "string" },
          { name: "ipfsHash", type: "string" },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: "BookAlreadyRead", msg: "O usuário já registrou a leitura deste livro." },
    { code: 6001, name: "MaxBooksReached", msg: "O usuário atingiu o limite de livros registrados." },
    { code: 6002, name: "IsbnTooLong", msg: "O ISBN excede o tamanho máximo permitido." },
    { code: 6003, name: "TitleTooLong", msg: "O título excede o tamanho máximo permitido." },
    { code: 6004, name: "IpfsHashTooLong", msg: "O hash IPFS excede o tamanho máximo permitido." },
    { code: 6005, name: "Overflow", msg: "Arithmetic overflow ao atualizar o estado do usuário." },
  ],
};
