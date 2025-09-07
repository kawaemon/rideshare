import type { Context } from "hono";
import { getUserIdFromHeader } from "../lib/auth";
import { badRequest, ok } from "../lib/http";
import type { CreateRideInput } from "../lib/validate";
import { getDbClient } from "../lib/db-client";
import { RideService } from "../services/ride.service";
// Input validation is handled by route-level zod validators (see routes)

export class RideController {
  private readonly service = new RideService(getDbClient());

  async list(c: Context) {
    const destination = c.req.query("destination") ?? undefined;
    const fromSpot = c.req.query("fromSpot") ?? undefined;
    const date = c.req.query("date") ?? undefined;
    const uid = getUserIdFromHeader(c) ?? undefined;
    const result = await this.service.list({ destination, fromSpot, date, viewerId: uid });
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return c.json(result.data);
  }

  async create(c: Context) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    type ReqWithValidJson<T> = { valid: (k: "json") => T };
    const input = (c.req as unknown as ReqWithValidJson<CreateRideInput>).valid("json");

    const result = await this.service.create(uid, input);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return c.json(result.data);
  }

  async detail(c: Context) {
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id)) {
      return badRequest(c, "invalid_id");
    }
    const uid = getUserIdFromHeader(c) ?? undefined;
    const result = await this.service.detail(uid, id);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return c.json(result.data);
  }

  async join(c: Context) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id)) {
      return badRequest(c, "invalid_id");
    }
    const result = await this.service.join(uid, id);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return ok(c);
  }

  async leave(c: Context) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id)) {
      return badRequest(c, "invalid_id");
    }
    const result = await this.service.leave(uid, id);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return ok(c);
  }

  async remove(c: Context) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    const id = Number(c.req.param("id"));
    if (!Number.isInteger(id)) {
      return badRequest(c, "invalid_id");
    }
    const result = await this.service.remove(uid, id);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return ok(c);
  }

  async listMine(c: Context) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    const roleVal = (c.req.query("role") ?? "all") as "driver" | "member" | "all";
    const result = await this.service.listMine(uid, roleVal);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return c.json(result.data);
  }
}
