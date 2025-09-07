import type { Context } from "hono";
import { getDbClient } from "../lib/db-client";
import { getUserIdFromHeader } from "../lib/auth";
import { badRequest } from "../lib/http";
import { UserIdSchema } from "../lib/validate";
// no additional schema needed for name; name = id

export class UserController {
  async getMe(c: Context) {
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }

    const db = getDbClient();
    const user = await db.findUserById(uid);
    if (!user) {
      return badRequest(c, "not_found");
    }

    return c.json({ id: user.id });
  }

  async putMe(c: Context) {
    // For hackathon: Allow creating/updating display name for current user id
    const uid = getUserIdFromHeader(c);
    if (!uid) {
      return badRequest(c, "unauthorized");
    }

    if (!UserIdSchema.safeParse(uid).success) {
      return badRequest(c, "invalid_user");
    }
    const db = getDbClient();
    const existing = await db.findUserById(uid);
    if (!existing) {
      await db.createUser(uid);
    }
    return c.json({ id: uid });
  }
}
