import { Hono } from "hono";
import { DashboardController } from "../controllers/dashboard.controller";

const ctrl = new DashboardController();
export const dashboardRoutes = new Hono();

dashboardRoutes.get("/dashapi", (c) => ctrl.getSummary(c));
