import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { RideController } from "../controllers/ride.controller";
import {
  CreateRideSchema,
  ListRidesQuerySchema,
  RideIdParamSchema,
  RoleSchema,
} from "../lib/validate";
import { z } from "zod";

const ctrl = new RideController();
export const rideRoutes = new Hono();

rideRoutes.get("/", zValidator("query", ListRidesQuerySchema), (c) => ctrl.list(c));
rideRoutes.post("/", zValidator("json", CreateRideSchema), (c) => ctrl.create(c));
rideRoutes.get("/:id", zValidator("param", z.object({ id: RideIdParamSchema })), (c) =>
  ctrl.detail(c),
);
rideRoutes.post("/:id/join", zValidator("param", z.object({ id: RideIdParamSchema })), (c) =>
  ctrl.join(c),
);
rideRoutes.post("/:id/leave", zValidator("param", z.object({ id: RideIdParamSchema })), (c) =>
  ctrl.leave(c),
);
rideRoutes.delete("/:id", zValidator("param", z.object({ id: RideIdParamSchema })), (c) =>
  ctrl.remove(c),
);

export const meRoutes = new Hono();
meRoutes.get("/rides", zValidator("query", z.object({ role: RoleSchema }).partial()), (c) =>
  ctrl.listMine(c),
);
