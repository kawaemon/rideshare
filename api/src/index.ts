import "dotenv/config"; // Load .env at startup
import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { rideRoutes, meRoutes } from "./routes/ride.routes";
import { userRoutes } from "./routes/user.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { ok } from "./lib/http";

const app = new Hono();

// Hackathon: Surface exceptions to clients for easier debugging
app.onError((err, c) => {
  // Log server-side
  console.error("Unhandled error:", err);
  const body = {
    ok: false,
    error: "internal_error",
    exception: err.name,
    message: err.message,
    stack: err.stack ?? "",
    path: c.req.path,
    method: c.req.method,
  };
  return c.json(body, 500);
});

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "X-User-Id"],
  }),
);
app.use("*", logger());

app.get("/healthz", (c) => ok(c));
app.get("/", (c) => c.text("rideshare api"));

app.route("/rides", rideRoutes);
app.route("/me", meRoutes);
app.route("/", userRoutes);
app.route("/", dashboardRoutes);

const port = Number(process.env.PORT ?? 8787);

console.log(`API listening on http://localhost:${port}`);

serve({ fetch: app.fetch, port, hostname: "0.0.0.0" });
