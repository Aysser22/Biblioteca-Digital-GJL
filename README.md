# Biblioteca Digital GJL

Projeto de dApp em Solana para gamificar a leitura escolar com modelo Read-to-Earn.

## Estrutura do repositório

- `Anchor.toml` — configuração Anchor para deploy Devnet
- `programs/biblioteca_digital_gjl/` — programa Anchor em Rust
- `tests/biblioteca_digital_gjl.ts` — testes Anchor
- `frontend/` — app React com Solana Wallet Adapter
- `ocr-service/` — microserviço Node.js com Tesseract OCR

## Deploy do Smart Contract (Devnet)

### Requisitos

- `solana-cli`
- `anchor` instalado globalmente
- carteira Solana configurada

### Configurar Devnet

```bash
solana config set --url devnet
solana config get
```

### Verificar carteira

```bash
solana address
solana balance
```

### Build e deploy Anchor

```bash
anchor build
anchor deploy --provider.cluster devnet
```

> Se o `programId` ainda for um placeholder (`Biblibrary11111111111111111111111111111111111`), atualize `programs/biblioteca_digital_gjl/src/lib.rs` e `Anchor.toml` após o deploy.

### Atualizar `Anchor.toml`

Se você gerar um novo `programId`, edite `Anchor.toml` em:

```toml
[programs.devnet]
biblioteca_digital_gjl = "<SEU_PROGRAM_ID>"
```

E atualize também o `declare_id!("...");` em `programs/biblioteca_digital_gjl/src/lib.rs`.

## Testes Anchor

Instale as dependências e execute:

```bash
npm install
npm test
```

A suíte de testes inclui:

- inicialização de `UserAccount`
- criação de `mint` SPL
- registro de leitura e mint de tokens

## Front-end React

### Instalação

```bash
cd frontend
npm install
```

### Execução local

```bash
npm run dev
```

### Pontos principais do UI

- `Connect Wallet` com Phantom e Solflare
- Leitura de perfil `UserAccount` on-chain
- Display de XP, nível e saldo SPL
- Formulário para registrar leitura pelo ISBN

### Configurar mint SPL no front-end

Insira o endereço do token SPL no campo de configuração antes de registrar leituras.

## OCR Service

### Instalação

```bash
cd ocr-service
npm install
```

### Execução

```bash
npm start
```

### Endpoint

- `POST /extract`
  - campo `image` no `multipart/form-data`
  - resposta: `{ title, isbn, rawText }`

## Makefile

Um Makefile foi adicionado para simplificar o fluxo do projeto.

- `make install` — instala dependências root, frontend e OCR
- `make test` — executa os testes Anchor
- `make dev` — inicia o frontend React
- `make build` — builda o frontend
- `make deploy-devnet` — executa o script `deploy-devnet.sh`
- `make clean` — remove dependências e build artifacts

## Deploy Devnet

Use o Makefile para buildar e publicar o programa Anchor na Devnet.

```bash
make deploy-devnet
```

## Observações importantes

- O smart contract usa `PDA` para derivar `UserAccount` e `mint_authority`.
- O `register_reading` valida duplicidade de ISBNs.
- O fluxo de tokenomics aplica um multiplicador de recompensa por nível.
- Em produção, sempre valide `mint_authority` como PDA e não exponha chaves privadas.
