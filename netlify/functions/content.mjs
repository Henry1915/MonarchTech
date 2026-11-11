import { getStore } from '@netlify/blobs';
import { timingSafeEqual } from 'node:crypto';

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const eq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };

export default async (req) => {
  const store = getStore('site');
  if (req.method === 'GET') {
    const d = await store.get('content', { type: 'json' });
    return d ? J(d) : J({ error: 'none' }, 404);
  }
  if (req.method !== 'POST') return J({ error: 'method' }, 405);
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return J({ error: 'ADMIN_PASSWORD is not set' }, 500);
  let b;
  try { b = await req.json(); } catch { return J({ error: 'bad json' }, 400); }

  const ip = (req.headers.get('x-nf-client-connection-ip') || 'x').replace(/[^a-z0-9.:-]/gi, '');
  const key = 'fail-' + ip;
  const f = await store.get(key, { type: 'json' });
  const recent = f && Date.now() - f.t < 60000;
  if (recent && f.n >= 5) return J({ error: 'locked' }, 429);
  if (!eq(b.password || '', secret)) {
    await store.setJSON(key, { n: (recent ? f.n : 0) + 1, t: Date.now() });
    await new Promise((r) => setTimeout(r, 800));
    return J({ error: 'denied' }, 401);
  }
  if (f) await store.delete(key);
  if (b.action === 'check') return J({ ok: true });
  if (b.action === 'save') {
    const d = b.data;
    if (!d || !Array.isArray(d.pages) || JSON.stringify(d).length > 500000) return J({ error: 'invalid' }, 400);
    await store.setJSON('content', d);
    return J({ ok: true });
  }
  return J({ error: 'action' }, 400);
};

export const config = { path: '/api/content' };
