import { getAllQuotes } from '../_shared.js';

// GET /api/hitokoto — a random-quote endpoint modeled on hitokoto.cn,
// meant to be called from *other* sites/widgets, not just this one.
// That is why it gets its own CORS headers (Access-Control-Allow-Origin: *)
// instead of staying same-origin like /api/quotes — the whole point of
// a "yiyan-style" API is that someone else's page can fetch it.
//
// Query parameters:
//   tag           repeatable, exact match, OR'd together
//                 e.g. ?tag=原神&tag=崩坏三
//   min_length    minimum character count of the quote text
//   max_length    maximum character count of the quote text
//   show_author   "false"/"0" to omit the author (default: true)
//   encode        "json" (default) or "text" for a plain-text line,
//                 formatted the way hitokoto's own text mode does:
//                 「quote」——author
//
// Deliberately NOT implemented: hitokoto's `encode=js` mode, which
// returns an executable <script> that mutates the including page's
// DOM directly. Serving executable JS from this endpoint would fight
// with this site's own CSP (script-src 'self') and is a meaningfully
// different trust model — a caller can always take the JSON/text
// response and do that themselves.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Counts by Unicode code point rather than UTF-16 code unit, so an
// emoji or other astral character counts as one character the way a
// person reading the quote would expect, not two.
function textLength(s) {
  return Array.from(s || '').length;
}

function parseLengthParam(value) {
  if (value === null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
}

function parseBoolParam(value, fallback) {
  if (value === null) return fallback;
  return value !== 'false' && value !== '0';
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet({ request, env }) {
  const params = new URL(request.url).searchParams;

  const tags = params.getAll('tag').map(t => t.trim()).filter(Boolean);
  const minLength = parseLengthParam(params.get('min_length'));
  const maxLength = parseLengthParam(params.get('max_length'));
  const showAuthor = parseBoolParam(params.get('show_author'), true);
  const encode = (params.get('encode') || 'json').toLowerCase();

  const all = await getAllQuotes(env);

  let pool = all;
  if (tags.length) {
    const tagSet = new Set(tags);
    pool = pool.filter(q => tagSet.has(q.tag));
  }
  if (minLength !== null) pool = pool.filter(q => textLength(q.text) >= minLength);
  if (maxLength !== null) pool = pool.filter(q => textLength(q.text) <= maxLength);

  if (!pool.length) {
    return new Response(JSON.stringify({ error: 'no quote matches the given filters' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        ...CORS_HEADERS,
      },
    });
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];

  const payload = {
    id: picked.id,
    text: picked.text,
    author: showAuthor ? (picked.author || null) : null,
    tag: picked.tag || null,
    length: textLength(picked.text),
    date: picked.date || null,
  };

  if (encode === 'text') {
    const line = payload.author ? `「${payload.text}」——${payload.author}` : `「${payload.text}」`;
    return new Response(line, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
        ...CORS_HEADERS,
      },
    });
  }

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...CORS_HEADERS,
    },
  });
}
