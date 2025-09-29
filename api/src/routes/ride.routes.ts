import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { RideController } from "../controllers/ride.controller";
import { CreateRideSchema, RideIdParamSchema, RoleSchema, UserIdSchema } from "../lib/validate";
import { z } from "zod";

const ctrl = new RideController();
export const rideRoutes = new Hono();

rideRoutes.get("/", (c) => ctrl.list(c));

rideRoutes.post("/", zValidator("json", CreateRideSchema), (c) => {
  const input = c.req.valid("json");
  return ctrl.create(c, input);
});

rideRoutes.get("/:id", zValidator("param", z.object({ id: RideIdParamSchema })), (c) => {
  const { id } = c.req.valid("param");
  return ctrl.detail(c, id);
});

rideRoutes.post("/:id/join", zValidator("param", z.object({ id: RideIdParamSchema })), (c) => {
  const { id } = c.req.valid("param");
  return ctrl.join(c, id);
});

rideRoutes.post("/:id/location-check", zValidator("param", z.object({ id: RideIdParamSchema })), (c) => {
  const { id } = c.req.valid("param");
  return ctrl.submitLocationCheck(c, id);
});

rideRoutes.post(
  "/:id/members/:memberId/verify",
  zValidator("param", z.object({ id: RideIdParamSchema, memberId: UserIdSchema })),
  (c) => {
    const { id, memberId } = c.req.valid("param");
    return ctrl.verifyMember(c, id, memberId);
  },
);

rideRoutes.post("/:id/leave", zValidator("param", z.object({ id: RideIdParamSchema })), (c) => {
  const { id } = c.req.valid("param");
  return ctrl.leave(c, id);
});

rideRoutes.delete("/:id", zValidator("param", z.object({ id: RideIdParamSchema })), (c) => {
  const { id } = c.req.valid("param");
  return ctrl.remove(c, id);
});

export const meRoutes = new Hono();
meRoutes.get("/rides", zValidator("query", z.object({ role: RoleSchema }).partial()), (c) => {
  const { role = "all" } = c.req.valid("query");
  return ctrl.listMine(c, role);
});
