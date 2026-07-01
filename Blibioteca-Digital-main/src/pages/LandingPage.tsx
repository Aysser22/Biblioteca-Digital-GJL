import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="page">
      <header className="topbar">
        <Link className="brandLink" to="/">
          ← Biblioteca Digital
        </Link>
      </header>

      <main className="content">
        <h2>Início</h2>
        <p>
          Este é um protótipo da Biblioteca Digital usando <b>Solana</b> para conectar
          carteiras e identificar o usuário. Por enquanto, as estatísticas são mockadas,
          mas o endereço da carteira é real.
        </p>

        <ul className="list">
          <li>Botão “Explorar livros” mostra uma lista/grid de livros (mock).</li>
          <li>
            Botão “Perfil” permite conectar carteira e exibir endereço + estatísticas.
          </li>
          <li>
            Depois, podemos evoluir para um programa Solana (on-chain) para persistir
            quantos livros você leu.
          </li>
        </ul>

        <div className="row">
          <Link className="btn" to="/explorar">
            Explorar livros
          </Link>
          <Link className="btn btnGhost" to="/perfil">
            Ir para perfil
          </Link>
        </div>
      </main>
    </div>
  );
}

