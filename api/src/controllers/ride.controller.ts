import type { Context } from "hono";
import { getConnInfo } from "@hono/node-server/conninfo";
import { getUserIdFromHeader } from "../lib/auth";
import { badRequest, ok } from "../lib/http";
import type { CreateRideInput } from "../domain/ride.dto";
import type { Role } from "../lib/validate";
import { getDbClient } from "../lib/db-client";
import { RideService } from "../services/ride.service";
// Input validation is handled by route-level zod validators (see routes)

export class RideController {
  private readonly service = new RideService(getDbClient());

  private getClientIp(c: Context): string | null {
    const forwardedFor = c.req.header("x-forwarded-for");
    if (forwardedFor) {
      const [first] = forwardedFor.split(",");
      const trimmed = first?.trim();
      if (trimmed && trimmed.length > 0) {
        return trimmed;
      }
    }

    const info = getConnInfo(c);
    const ip = info.remote?.address;
    return ip && ip.length > 0 ? ip : null;
  }

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

  async submitLocationCheck(c: Context, rideId: number) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }

    const ip = this.getClientIp(c);
    if (!ip) {
      return badRequest(c, "ip_unavailable");
    }

    const result = await this.service.submitLocationCheck(uid, rideId, ip);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return c.json(result.data);
  }

  async verifyMember(c: Context, rideId: number, memberId: string) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }
    const result = await this.service.verifyMember(uid, rideId, memberId);
    if (!result.ok) {
      return badRequest(c, result.error);
    }
    return ok(c);
  }
}
