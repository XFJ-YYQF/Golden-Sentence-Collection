import {
  jsonResponse,
  errorResponse,
  getAllQuotes,
  saveAllQuotes,
  isAuthorized,
  unauthorized,
} from '../../_shared.js';

// DELETE /api/quotes/:id — requires X-Admin-Key
export async function onRequestDelete({ params, request, env }) {
  if (!isAuthorized(request, env)) return unauthorized();

  const id = params.id;
  if (!id) return errorResponse('missing id');

  const quotes = await getAllQuotes(env);
  const next = quotes.filter(q => q.id !== id);

  if (next.length === quotes.length) {
    return errorResponse('not found', 404);
  }

  await saveAllQuotes(env, next);
  return new Response(null, { status: 204 });
}
