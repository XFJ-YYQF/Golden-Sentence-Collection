import { jsonResponse, isAuthorized, unauthorized } from '../../_shared.js';

// POST /api/auth/verify — checks X-Admin-Key against the ADMIN_KEY
// secret and returns 200/401. Does not read or write any quote data;
// it exists purely so the admin dashboard can validate a key on
// "login" without needing to perform a real write to prove it works.
export async function onRequestPost({ request, env }) {
  if (!isAuthorized(request, env)) return unauthorized();
  return jsonResponse({ ok: true });
}
