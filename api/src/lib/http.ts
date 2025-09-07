import type { Context } from "hono";

export function unauthorized(c: Context) {
  return c.json({ ok: false, error: "unauthorized" }, 401);
}

export function forbidden(c: Context) {
  return c.json({ ok: false, error: "forbidden" }, 403);
}

export function badRequest(c: Context, error = "invalid_request") {
  return c.json({ ok: false, error }, 400);
}

export function notFound(c: Context, error = "not_found") {
  return c.json({ ok: false, error }, 404);
}

export function ok(c: Context) {
  return c.json({ ok: true });
}
