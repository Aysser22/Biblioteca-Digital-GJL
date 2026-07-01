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
const sessions = new Map();
function requireAuth(req, res, next) {
    const sid = req.cookies?.sid;
    if (!sid)
        return res.status(401).json({ error: 'Not authenticated' });
    const session = sessions.get(sid);
    if (!session)
        return res.status(401).json({ error: 'Not authenticated' });
    req.session = session;
    next();
}
app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
}));
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
function cryptoRandom() {
    // Evita dependência extra
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
app.get('/', (_req, res) => {
    res.send('Biblioteca Digital - Auth Server');
});
app.listen(PORT, () => {
    console.log(`[server] rodando em ${BASE_URL}`);
});
