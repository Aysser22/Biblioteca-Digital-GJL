type StatsResponse = {
  booksReadCount: number;
  streak: number;
  favBooks: number;
  booksRead: string[];
  booksToRead: string[];
};

type MarkReadBody = {
  address: string;
  bookId: string;
};

type MarkToReadBody = {
  address: string;
  bookId: string;
};

function getAuthBaseUrl() {
  return import.meta.env.VITE_AUTH_BASE_URL ?? 'http://localhost:4000';
}

export async function fetchStats(address: string): Promise<StatsResponse> {
  const base = getAuthBaseUrl();
  const res = await fetch(`${base}/api/stats?address=${encodeURIComponent(address)}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to fetch stats: ${res.status}`);
  }

  return (await res.json()) as StatsResponse;
}

export async function markRead(address: string, bookId: string) {
  const base = getAuthBaseUrl();
  const body: MarkReadBody = { address, bookId };
  const res = await fetch(`${base}/api/stats/mark-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to mark read: ${res.status}`);
  }

  return await res.json();
}

export async function markToRead(address: string, bookId: string) {
  const base = getAuthBaseUrl();
  const body: MarkToReadBody = { address, bookId };
  const res = await fetch(`${base}/api/stats/mark-to-read`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Failed to mark to read: ${res.status}`);
  }

  return await res.json();
}

