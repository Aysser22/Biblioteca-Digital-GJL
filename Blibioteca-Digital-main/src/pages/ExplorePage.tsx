import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type Book = {
  id: string;
  title: string;
  author: string;
  tags: string[];
  coverUrl: string;
};

const MOCK_BOOKS: Book[] = [
  {
    id: 'hp1',
    title: 'Harry Potter e a Pedra Filosofal',
    author: 'J. K. Rowling',
    tags: ['Harry Potter', 'Magia'],
    // coverUrl (pode ser ajustado depois; aqui usamos capa ilustrativa e consistente por obra/edição)
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg',
  },
  {
    id: 'hp2',
    title: 'Harry Potter e a Câmara Secreta',
    author: 'J. K. Rowling',
    tags: ['Harry Potter', 'Magia'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780439064873-L.jpg',
  },
  {
    id: 'hp3',
    title: 'Harry Potter e o Prisioneiro de Azkaban',
    author: 'J. K. Rowling',
    tags: ['Harry Potter', 'Magia'],
    // Capa via Google Books (imagem direta)
    coverUrl: 'https://m.media-amazon.com/images/I/81u+ljPVifL.jpg',
  },
  {
    id: 'hp4',
    title: 'Harry Potter e o Cálice de Fogo',
    author: 'J. K. Rowling',
    tags: ['Harry Potter', 'Magia'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780439139601-L.jpg',
  },
  {
    id: 'hp5',
    title: 'Harry Potter e a Ordem da Fênix',
    author: 'J. K. Rowling',
    tags: ['Harry Potter', 'Magia'],
    // Capa via Google Books (imagem direta)
    coverUrl: 'https://m.media-amazon.com/images/I/61tA6NcthmL._AC_UF1000,1000_QL80_.jpg',
  },
  {
    id: 'hp6',
    title: 'Harry Potter e o Enigma do Príncipe',
    author: 'J. K. Rowling',
    tags: ['Harry Potter', 'Magia'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780439785969-L.jpg',
  },
  {
    id: 'hp7',
    title: 'Harry Potter e as Relíquias da Morte',
    author: 'J. K. Rowling',
    tags: ['Harry Potter', 'Magia'],
    // Capa via Google Books (imagem direta)
    coverUrl: 'https://rocco.com.br/wp-content/uploads/2024/04/9786555324075.jpg',
  },
];


export default function ExplorePage() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string>('');

  const tags = useMemo(() => {
    const s = new Set<string>();
    MOCK_BOOKS.forEach((b) => b.tags.forEach((t) => s.add(t)));
    return Array.from(s);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_BOOKS.filter((b) => {
      const matchesQuery =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      const matchesTag = !tag || b.tags.includes(tag);
      return matchesQuery && matchesTag;
    });
  }, [query, tag]);

  return (
    <div className="page">
      <header className="topbar">
        <Link className="brandLink" to="/">
          ← Biblioteca Digital
        </Link>
        <Link className="topLink" to="/perfil">
          Perfil
        </Link>
      </header>

      <main className="content">
        <h2>Explorar livros</h2>
        <p>Interaja com os livros para atualizar seu perfil (lidos / quero ler).</p>


        <div className="filters">
          <input
            className="input"
            placeholder="Buscar por título ou autor..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="select" value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">Todas as categorias</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="bookGrid">
          {filtered.map((b) => (
            <div key={b.id} className="bookCard">
              <div className="bookCoverWrap">
                <img className="bookCover" src={b.coverUrl} alt={b.title} />
              </div>
              <div className="bookTitle">{b.title}</div>
              <div className="bookAuthor">por {b.author}</div>

              <div className="tagRow">
                {b.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="bookMeta">
                <span className="availability">
                  <span className="dot dotGreen" aria-hidden="true" />Disponível
                </span>
              </div>
              <button className="btn btnSmall" type="button" disabled>
                Ler agora
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && <div className="muted">Nenhum livro encontrado.</div>}
      </main>
    </div>
  );
}

