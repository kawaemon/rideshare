import { Hono } from "hono";
import { UserController } from "../controllers/user.controller";

const ctrl = new UserController();
export const userRoutes = new Hono();

userRoutes.get("/me", (c) => ctrl.getMe(c));
userRoutes.put("/me", (c) => ctrl.putMe(c));
