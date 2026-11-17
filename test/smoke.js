// Starts the server in MOCK mode and checks pages + API safety rules.
import { spawn } from 'node:child_process';
const port = 3999, base = `http://localhost:${port}`;
const srv = spawn('node', ['server.js'], { env: { ...process.env, PORT: port, MOCK: '1', FAL_KEY: '' }, stdio: 'inherit' });
await new Promise((r) => setTimeout(r, 1200));
let fail = 0;
const ok = (c, m) => { console.log((c ? '✔ ' : '✘ ') + m); if (!c) fail++; };
try {
  for (const p of ['/', '/privacy', '/terms', '/guidelines', '/support', '/delete-data', '/manifest.webmanifest', '/sw.js', '/icons/icon-512.png']) {
    const r = await fetch(base + p); const txt = await r.text();
    ok(r.status === 200 && !txt.includes('{{'), `GET ${p}`);
  }
  const cat = await (await fetch(base + '/api/catalog')).json();
  ok(Object.keys(cat).length === 9, 'catalog has 9 tools');
  const img = 'data:image/jpeg;base64,' + Buffer.from('fake').toString('base64');
  const post = (b) => fetch(base + '/api/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
  ok((await post({ image: img, tool: 'slim', level: 3 })).status === 400, 'rejects without consent');
  ok((await post({ image: img, tool: 'undress', consent: true })).status === 400, 'rejects unknown tool');
  ok((await post({ image: img, tool: 'outfit', option: 'bikini', consent: true })).status === 400, 'rejects unlisted outfit');
  ok((await post({ image: 'http://x/y.jpg', tool: 'slim', consent: true })).status === 400, 'rejects non data-uri');
  const r = await post({ image: img, tool: 'slim', level: 3, consent: true });
  ok(r.status === 200 && (await r.json()).image === img, 'mock edit works');
  ok((await fetch(base + '/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"reason":"other"}' })).ok, 'report works');
} finally { srv.kill(); }
process.exit(fail ? 1 : 0);
