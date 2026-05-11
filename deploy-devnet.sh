#!/usr/bin/env bash
set -euo pipefail

if ! command -v anchor >/dev/null 2>&1; then
  echo "Erro: Anchor CLI nao encontrado no PATH. Instale o Anchor antes de executar deploy."
  exit 1
fi

if ! command -v solana >/dev/null 2>&1; then
  echo "Erro: Solana CLI nao encontrado no PATH. Instale o Solana CLI antes de executar deploy."
  exit 1
fi

echo "Configurando cluster para devnet..."
solana config set --url devnet >/dev/null

echo "Buildando programa Anchor..."
anchor build

echo "Publicando programa na devnet..."
anchor deploy --provider.cluster devnet

echo "Deploy concluido."
