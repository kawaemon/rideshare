import type { Context } from "hono";
import { getUserIdFromHeader } from "../lib/auth";
import { badRequest, ok } from "../lib/http";
import type { CreateRideInput, Role } from "../lib/validate";
import { getDbClient } from "../lib/db-client";
import { RideService } from "../services/ride.service";
// Input validation is handled by route-level zod validators (see routes)

export class RideController {
  private readonly service = new RideService(getDbClient());

  async list(c: Context) {
    const uid = getUserIdFromHeader(c) ?? undefined;
    const result = await this.service.list({ viewerId: uid });
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return c.json(result.data);
  }

  async create(c: Context, input: CreateRideInput) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }

    const result = await this.service.create(uid, input);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return c.json(result.data);
  }

  async detail(c: Context, id: number) {
    const uid = getUserIdFromHeader(c) ?? undefined;
    const result = await this.service.detail(uid, id);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return c.json(result.data);
  }

  async join(c: Context, id: number) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    const result = await this.service.join(uid, id);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return ok(c);
  }

  async leave(c: Context, id: number) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    const result = await this.service.leave(uid, id);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return ok(c);
  }

  async remove(c: Context, id: number) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    const result = await this.service.remove(uid, id);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return ok(c);
  }

  async listMine(c: Context, role: Role) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    const result = await this.service.listMine(uid, role);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return c.json(result.data);
  }
}
