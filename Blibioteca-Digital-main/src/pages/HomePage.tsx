import React from 'react';
import { Link } from 'react-router-dom';

function Card({
  title,
  description,
  to,
}: {
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link className="card" to={to}>
      <div className="cardTitle">{title}</div>
      <div className="cardDesc">{description}</div>
      <div className="cardCta">Entrar →</div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">📚 Biblioteca Digital</div>
        <Link className="topLink" to="/perfil">
          Perfil
        </Link>
      </header>

      <main className="hero">
        <h1>Bem-vindo</h1>
        <p>Explore livros, veja seu perfil e acompanhe suas estatísticas.</p>

        <div className="grid">
          <Card
            title="Explorar livros"
            description="Encontre livros e comece a leitura."
            to="/explorar"
          />
          <Card
            title="Perfil"
            description="Conecte sua carteira Solana e veja estatísticas."
            to="/perfil"
          />
          <Card
            title="Início"
            description="Saiba mais sobre o projeto."
            to="/inicio"
          />
        </div>
      </main>

      <footer className="footer">Feito para a escola • Solana • Web</footer>
    </div>
  );
}

