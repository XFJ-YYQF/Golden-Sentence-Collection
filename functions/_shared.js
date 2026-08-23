// Shared helpers used by every /api/* function.
//
// Storage model: the whole quote list lives under a single KV key
// ("quotes"), stored as one JSON array. That is enough for a personal
// collection (reads are one KV get, writes are read-modify-write) and
// avoids needing a database for what is fundamentally a small list.
//
// Auth model: GET is public (the point of the site is to show the
// quotes). POST and DELETE require a header:
//   X-Admin-Key: <value of the ADMIN_KEY secret>
// ADMIN_KEY is set as an encrypted environment variable in the
// Cloudflare Pages project settings — it is never committed to the
// repo. Without it, anyone who found the API URL could add or delete
// entries, which is not acceptable even for a low-stakes personal
// site.

const KV_KEY = 'quotes';
const MAX_QUOTES = 5000; // sane upper bound so one bad actor cannot balloon storage forever

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

export async function getAllQuotes(env) {
  const raw = await env.QUOTES_KV.get(KV_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export async function saveAllQuotes(env, quotes) {
  await env.QUOTES_KV.put(KV_KEY, JSON.stringify(quotes));
}

// Constant-time-ish string compare so a mistyped key does not leak
// timing information about how many leading characters matched.
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function isAuthorized(request, env) {
  if (!env.ADMIN_KEY) return false; // fail closed if the secret was never configured
  const provided = request.headers.get('X-Admin-Key') || '';
  return safeEqual(provided, env.ADMIN_KEY);
}

export function unauthorized() {
  return errorResponse('unauthorized', 401);
}

export function sanitizeQuoteInput(body) {
  const text = String(body && body.text || '').trim().slice(0, 2000);
  const author = String(body && body.author || '').trim().slice(0, 200);
  const tag = String(body && body.tag || '').trim().slice(0, 100);
  return { text, author, tag };
}

export { MAX_QUOTES };
