import type { Context } from "hono";
import { DashboardService } from "../services/dashboard.service";
import { getDbClient } from "../lib/db-client";

export class DashboardController {
  private readonly service = new DashboardService(getDbClient());

  async getSummary(c: Context) {
    const summary = await this.service.getSummary();
    return c.json(summary);
  }
}
