import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';
const PORT = Number(process.env.PORT ?? 4000);
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

// Para simplificar, usamos sessão em memória.
// Em produção, troque por Redis/DB.
type Session = {
  email?: string;
  name?: string;
  picture?: string;
};

const sessions = new Map<string, Session>();

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const sid = req.cookies?.sid;
  if (!sid) return res.status(401).json({ error: 'Not authenticated' });
  const session = sessions.get(sid);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  (req as any).session = session;
  next();
}

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  }),
);

app.get('/auth/google/start', (_req, res) => {
  return res.status(410).json({ error: 'Google login desativado' });
});

app.get('/auth/google/callback', (_req, res) => {
  return res.status(410).send('Google login desativado');
});

app.get('/auth/me', (_req, res) => {
  return res.status(410).json({ error: 'Google login desativado' });
});

app.post('/auth/logout', (_req, res) => {
  return res.status(410).json({ ok: true });
});

// -----------------------------
// Stats API (backend real - sem on-chain por enquanto)
// Persistência em memória (Map). Em seguida podemos plugar no on-chain.
// -----------------------------

type BookId = string;

type UserStats = {
  booksRead: BookId[];
  booksToRead: BookId[];
};

const statsByAddress = new Map<string, UserStats>();

function normalizeAddress(address: string) {
  return address.trim();
}

function getOrCreateStats(address: string): UserStats {
  const existing = statsByAddress.get(address);
  if (existing) return existing;
  const created: UserStats = { booksRead: [], booksToRead: [] };
  statsByAddress.set(address, created);
  return created;
}

app.get('/api/stats', (req, res) => {
  const address = normalizeAddress(String(req.query.address ?? ''));
  if (!address) return res.status(400).json({ error: 'address is required' });

  const s = getOrCreateStats(address);

  return res.json({
    booksReadCount: s.booksRead.length,
    streak: 0,
    favBooks: 0,
    booksRead: s.booksRead,
    booksToRead: s.booksToRead,
  });
});

app.post('/api/stats/mark-read', (req, res) => {
  const { address, bookId } = req.body as { address?: string; bookId?: BookId };
  const a = normalizeAddress(String(address ?? ''));
  const b = String(bookId ?? '');
  if (!a || !b) return res.status(400).json({ error: 'address and bookId are required' });

  const s = getOrCreateStats(a);
  if (!s.booksRead.includes(b)) s.booksRead.push(b);
  s.booksToRead = s.booksToRead.filter((id) => id !== b);

  return res.json({ ok: true, booksReadCount: s.booksRead.length });
});

app.post('/api/stats/mark-to-read', (req, res) => {
  const { address, bookId } = req.body as { address?: string; bookId?: BookId };
  const a = normalizeAddress(String(address ?? ''));
  const b = String(bookId ?? '');
  if (!a || !b) return res.status(400).json({ error: 'address and bookId are required' });

  const s = getOrCreateStats(a);
  if (!s.booksToRead.includes(b)) s.booksToRead.push(b);
  s.booksRead = s.booksRead.filter((id) => id !== b);

  return res.json({ ok: true, booksToReadCount: s.booksToRead.length });
});

app.get('/', (_req, res) => {
  res.send('Biblioteca Digital - API');
});

app.listen(PORT, () => {
  console.log(`[server] rodando em ${BASE_URL}`);
});

