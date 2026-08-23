import {
  jsonResponse,
  errorResponse,
  getAllQuotes,
  saveAllQuotes,
  isAuthorized,
  unauthorized,
  sanitizeQuoteInput,
  MAX_QUOTES,
} from '../_shared.js';

// GET /api/quotes — public, returns the full list.
export async function onRequestGet({ env }) {
  const quotes = await getAllQuotes(env);
  return jsonResponse(quotes);
}

// POST /api/quotes — requires X-Admin-Key, body: { text, author?, tag? }
export async function onRequestPost({ request, env }) {
  if (!isAuthorized(request, env)) return unauthorized();

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return errorResponse('invalid JSON body');
  }

  const { text, author, tag } = sanitizeQuoteInput(body);
  if (!text) return errorResponse('text is required');

  const quotes = await getAllQuotes(env);
  if (quotes.length >= MAX_QUOTES) {
    return errorResponse('quote limit reached', 413);
  }

  const quote = {
    id: 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    text,
    author,
    tag,
    date: new Date().toISOString().slice(0, 10),
  };

  quotes.unshift(quote);
  await saveAllQuotes(env, quotes);

  return jsonResponse(quote, 201);
}
