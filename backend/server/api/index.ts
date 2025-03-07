import { Hono } from 'hono';
import { handle } from '@hono/node-server/vercel';
import { createApp } from '../app.js';

const app = new Hono();

// Initialize the app
const { app: honoApp } = await createApp();

// Use the Hono app as middleware
app.use('*', async (c) => honoApp.fetch(c.req.raw, c));

// Export the handler for Vercel
export default handle(app); 