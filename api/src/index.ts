import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { rideRoutes, meRoutes } from "./routes/ride.routes";
import { userRoutes } from "./routes/user.routes";
import { ok } from "./lib/http";

const app = new Hono();

app.use("*", cors());
app.use("*", logger());

app.get("/healthz", (c) => ok(c));
app.get("/", (c) => c.text("rideshare api"));

app.route("/rides", rideRoutes);
app.route("/me", meRoutes);
app.route("/", userRoutes);

const port = Number(process.env.PORT ?? 8787);

console.log(`API listening on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
