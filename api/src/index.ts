import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/healthz', (c) => c.json({ ok: true }));
app.get('/', (c) => c.text('rideshare api'));

const port = Number(process.env.PORT ?? 8787);
console.log(`API listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });

