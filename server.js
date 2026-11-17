import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fal } from '@fal-ai/client';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPrompt, publicCatalog } from './lib/presets.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');

const PORT = process.env.PORT || 3000;
const FAL_KEY = process.env.FAL_KEY || '';
const MOCK = process.env.MOCK === '1' || !FAL_KEY;
const EDIT_MODEL = process.env.EDIT_MODEL || 'fal-ai/flux-pro/kontext';
const NSFW_MODEL = 'fal-ai/imageutils/nsfw';
const NSFW_THRESHOLD = Number(process.env.NSFW_THRESHOLD || 0.3);
const DAILY_LIMIT = Number(process.env.DAILY_LIMIT || 20);

const SITE = {
  APP_NAME: process.env.APP_NAME || 'BodyEdit AI',
  SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || 'support@example.com',
  COMPANY: process.env.COMPANY_NAME || 'BodyEdit AI',
  UPDATED: '17 November 2026',
};

if (!MOCK) fal.config({ credentials: FAL_KEY });

const app = express();
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'data:', 'blob:'],
        'connect-src': ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(express.json({ limit: '9mb' }));

// ---------- HTML with site placeholders ----------
const htmlCache = new Map();
async function sendHtml(res, file) {
  let html = htmlCache.get(file);
  if (!html) {
    html = await readFile(path.join(PUBLIC, file), 'utf8');
    for (const [k, v] of Object.entries(SITE)) html = html.replaceAll(`{{${k}}}`, v);
    if (process.env.NODE_ENV === 'production') htmlCache.set(file, html);
  }
  res.type('html').send(html);
}
const PAGES = { '/': 'index.html', '/privacy': 'privacy.html', '/terms': 'terms.html', '/guidelines': 'guidelines.html', '/support': 'support.html', '/delete-data': 'delete-data.html' };
for (const [route, file] of Object.entries(PAGES)) {
  app.get(route, (_req, res, next) => sendHtml(res, file).catch(next));
  if (route !== '/') app.get(`${route}.html`, (_req, res) => res.redirect(301, route));
}
app.get('/index.html', (_req, res) => res.redirect(301, '/'));
app.use(express.static(PUBLIC, { index: false, maxAge: '1h' }));

// ---------- API ----------
app.get('/api/health', (_req, res) => res.json({ ok: true, mock: MOCK }));
app.get('/api/catalog', (_req, res) => res.json(publicCatalog()));

const editLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  limit: DAILY_LIMIT,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'daily_limit', message: 'Daily limit reached. Please come back tomorrow.' },
});
const burstLimiter = rateLimit({ windowMs: 60 * 1000, limit: 6, message: { error: 'slow_down', message: 'Too many requests, wait a minute.' } });

const DATA_URI = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

async function nsfwScore(imageUrl) {
  if (MOCK) return 0;
  const { data } = await fal.subscribe(NSFW_MODEL, { input: { image_url: imageUrl } });
  if (typeof data?.nsfw_probability !== 'number') throw new Error('bad nsfw response');
  return data.nsfw_probability;
}

async function toDataUri(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch result ${r.status}`);
  const type = r.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await r.arrayBuffer());
  return `data:${type};base64,${buf.toString('base64')}`;
}

app.post('/api/edit', burstLimiter, editLimiter, async (req, res) => {
  const { image, tool, level, option, consent } = req.body || {};

  if (consent !== true) return res.status(400).json({ error: 'consent', message: 'Please confirm you are 18+ and have the right to edit this photo.' });
  if (typeof image !== 'string' || !DATA_URI.test(image) || image.length > 9_000_000)
    return res.status(400).json({ error: 'image', message: 'Upload a JPEG, PNG or WebP image under 6 MB.' });

  const prompt = buildPrompt(tool, level, option);
  if (!prompt) return res.status(400).json({ error: 'tool', message: 'Unknown edit option.' });

  try {
    // 1) Input moderation — fail closed
    const inScore = await nsfwScore(image);
    if (inScore > NSFW_THRESHOLD) {
      return res.status(422).json({ error: 'blocked_input', message: 'This photo can’t be edited. Please upload a photo where the person is fully clothed. See our Content Guidelines.' });
    }

    // 2) Edit
    let resultUrl;
    if (MOCK) {
      resultUrl = image;
    } else {
      const { data } = await fal.subscribe(EDIT_MODEL, {
        input: { prompt, image_url: image, safety_tolerance: '1', output_format: 'jpeg', num_images: 1 },
      });
      if (data?.has_nsfw_concepts?.some(Boolean)) {
        return res.status(422).json({ error: 'blocked_output', message: 'The result was blocked by our safety filter. Try another option.' });
      }
      resultUrl = data?.images?.[0]?.url;
      if (!resultUrl) throw new Error('no image in response');
    }

    // 3) Output moderation — fail closed
    const outScore = await nsfwScore(resultUrl);
    if (outScore > NSFW_THRESHOLD) {
      return res.status(422).json({ error: 'blocked_output', message: 'The result was blocked by our safety filter. Try another option.' });
    }

    const result = resultUrl.startsWith('data:') ? resultUrl : await toDataUri(resultUrl);
    res.json({ image: result });
  } catch (err) {
    console.error('[edit] failed:', err?.message || err);
    res.status(502).json({ error: 'failed', message: 'Editing failed, please try again in a moment.' });
  }
});

// Reports of objectionable content (required for UGC apps by App Store 1.2 / Google Play UGC policy)
const reportLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20 });
app.post('/api/report', reportLimiter, (req, res) => {
  const { reason, details } = req.body || {};
  const entry = {
    at: new Date().toISOString(),
    reason: String(reason || '').slice(0, 60),
    details: String(details || '').slice(0, 1000),
  };
  console.log('[report]', JSON.stringify(entry));
  res.json({ ok: true });
});

// Contact form (support requests, data questions)
app.post('/api/contact', reportLimiter, (req, res) => {
  const { email, message } = req.body || {};
  if (!message || String(message).trim().length < 5) return res.status(400).json({ error: 'message' });
  console.log('[contact]', JSON.stringify({ at: new Date().toISOString(), email: String(email || '').slice(0, 200), message: String(message).slice(0, 2000) }));
  res.json({ ok: true });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'not_found' });
  res.status(404).type('html').send('<!doctype html><meta name=viewport content="width=device-width"><title>Not found</title><body style="font-family:system-ui;padding:40px;text-align:center"><h1>Page not found</h1><a href="/">Back to editor</a>');
});

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'image', message: 'Image is too large (max 6 MB).' });
  res.status(500).json({ error: 'server' });
});

app.listen(PORT, () => console.log(`${SITE.APP_NAME} on :${PORT}${MOCK ? ' (MOCK mode — set FAL_KEY for real edits)' : ''}`));
