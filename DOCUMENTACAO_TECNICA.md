# Documentacao Tecnica e Analise de Codigo

## 1. Visao Geral

A Biblioteca Digital GJL e um projeto Read-to-Earn em Solana, composto por tres blocos principais:

- Smart contract Anchor em Rust para registrar leitura e distribuir recompensa em token SPL.
- Frontend React + Vite para interacao do usuario com carteira Solana.
- Microservico OCR em Node.js para extrair titulo e ISBN de imagem.

Objetivo funcional: gamificar leitura escolar com XP, nivel e recompensa on-chain.

## 2. Arquitetura do Projeto

### 2.1 Modulos

- `programs/biblioteca_digital_gjl/src/lib.rs`
  - Programa Anchor com instrucoes `initialize_user`, `create_book`, `register_reading`.
  - Usa PDA para `user_account` e `mint_authority`.
  - Emite evento `ReadingCompleted`.

- `tests/biblioteca_digital_gjl.ts`
  - Suite Anchor para inicializacao de perfil e registro de leitura com mint SPL.

- `frontend/src/App.tsx`
  - Interface principal de exploracao de livros, perfil e registro de leitura.
  - Integra wallet adapter (Phantom e Solflare).
  - Faz fetch de conta Anchor e tenta registrar leitura no programa.

- `frontend/src/idl.ts`
  - IDL estatico consumido pelo frontend.

- `ocr-service/index.js`
  - API Express com endpoint `POST /extract`.
  - Usa Tesseract para OCR e regex para extração de ISBN.

### 2.2 Fluxo de Leitura (alto nivel)

1. Usuario conecta carteira no frontend.
2. Frontend deriva `user_account` PDA e `mint_authority` PDA.
3. Usuario cria perfil on-chain (`initialize_user`) se necessario.
4. Usuario envia ISBN no frontend.
5. Frontend chama `register_reading`.
6. Programa valida duplicidade, soma XP, recalcula nivel e faz `mint_to` no token account do usuario.
7. Frontend recarrega perfil e saldo de token.

## 3. Regras de Negocio On-chain

### 3.1 Estado

- `UserAccount`
  - `owner: Pubkey`
  - `xp: u64`
  - `level: u8`
  - `total_tokens: u64`
  - `books_read: Vec<String>`

- `BookAccount`
  - `owner: Pubkey`
  - `isbn`, `title`, `ipfs_hash`

### 3.2 Recompensa

- XP por leitura: +100.
- Nivel calculado por funcao `compute_level`.
- Multiplicador de recompensa: `1 + floor(level / 3)`.
- Base de recompensa: 10 tokens por leitura.
- Recompensa final: `10 * multiplicador`.

### 3.3 Validacoes

- ISBN nao pode repetir para o mesmo usuario.
- Limites de tamanho para ISBN, titulo e hash IPFS.
- Protecao de overflow com `checked_add` e `checked_mul`.

## 4. OCR Service

### 4.1 Endpoint

- `POST /extract` (multipart/form-data)
- Campo esperado: `image`
- Resposta:
  - `title`
  - `isbn`
  - `rawText`

### 4.2 Observacoes

- OCR inicializado em ingles (`eng`).
- Extração de ISBN baseada em regex para ISBN-13 com separadores opcionais.

## 5. Analise Tecnica (achados)

### 5.1 Criticidade Alta

1. Capacidade de `books_read` pode estourar apos 50 livros.
   - O tamanho de conta reserva espaco para `MAX_BOOKS_READ = 50`, mas nao existe validacao antes do `push` em `register_reading`.
   - Impacto: falha de transacao por falta de espaco em conta quando usuario ultrapassar limite.

2. `programId` ainda esta com placeholder.
   - O valor `Biblibrary11111111111111111111111111111111111` aparece no programa e no Anchor.toml.
   - Impacto: risco de inconsistencias de deploy e integracao quando migrar para ambiente real.

### 5.2 Criticidade Media

3. Frontend espera campos que nao existem no estado on-chain.
   - `favoriteGenres`, `readingGoal` e `achievements` sao lidos no frontend, mas nao estao em `UserAccount` do contrato.
   - Hoje ha fallback local, mas gera divergencia de modelo e manutencao mais dificil.

4. Registro de leitura no frontend nao cria ATA quando ausente.
   - O frontend usa `getAssociatedTokenAddress`, mas nao executa criacao de ATA como no teste.
   - Impacto: `registerReading` pode falhar para usuarios sem conta associada ao mint.

5. Alvo de deploy no Makefile aponta para script inexistente.
   - `make deploy-devnet` chama `./deploy-devnet.sh`, que nao existe no repositório.

### 5.3 Criticidade Baixa

6. Documentacao operacional sugere `anchor test`, mas ambiente sem Anchor falha imediatamente.
   - No ambiente analisado, `npm test` falhou com `anchor: not found`.
   - Impacto: onboarding mais lento para quem nao tem toolchain Solana/Anchor instalado.

7. Build do frontend apresenta erros TypeScript no ambiente atual.
   - `npm run build` em `frontend/` retornou erros TS7026 de JSX.
   - Necessario investigar ambiente/dependencias e possiveis inconsistencias de instalacao.

## 6. Estado de Execucao Validado nesta Analise

- `npm test` (raiz): falhou por ausencia de Anchor CLI no ambiente.
- `npm run build` (frontend): falhou com erros TypeScript JSX.
- `node --check index.js` (ocr-service): sem erro de sintaxe.
- `deploy-devnet.sh`: nao encontrado.

## 7. Recomendacoes Prioritarias

1. Corrigir limite de livros no contrato.
   - Adicionar validacao explicita `books_read.len() < MAX_BOOKS_READ` antes de inserir novo ISBN.
   - Criar erro especifico, por exemplo `MaxBooksReached`.

2. Fechar ciclo de token account no frontend.
   - Criar ATA automaticamente quando nao existir antes de chamar `registerReading`.

3. Padronizar modelo de dados entre contrato e frontend.
   - Opcoes:
   - Remover campos nao on-chain do tipo de perfil no frontend.
   - Ou evoluir contrato para persistir esses campos.

4. Consertar fluxo de deploy.
   - Criar `deploy-devnet.sh` ou ajustar Makefile para comandos Anchor diretos.

5. Melhorar reproducibilidade de setup.
   - Incluir versoes minimas de Solana CLI e Anchor.
   - Incluir checklist de pre-requisitos e verificacao rapida de ambiente.

## 8. Guia Rapido de Execucao

### 8.1 Contrato e testes

- Instalar toolchain Solana/Anchor.
- Executar `npm install` na raiz.
- Executar `npm test`.

### 8.2 Frontend

- Entrar em `frontend/`.
- Executar `npm install`.
- Configurar `.env` com:
  - `VITE_PROGRAM_ID`
  - `VITE_MINT_ADDRESS`
- Executar `npm run dev`.

### 8.3 OCR

- Entrar em `ocr-service/`.
- Executar `npm install`.
- Executar `npm start`.

## 9. Roadmap Sugerido

- Curto prazo
  - Corrigir limite de livros e ATA.
  - Ajustar deploy-devnet e setup.

- Medio prazo
  - Gerar IDL automaticamente no pipeline e sincronizar frontend.
  - Cobrir casos de erro com testes Anchor (ISBN repetido, overflow e limite maximo).

- Longo prazo
  - Adicionar autenticidade de leitura (prova OCR assinada/off-chain attestation).
  - Criar painel administrativo para curadoria de livros e auditoria de recompensas.
