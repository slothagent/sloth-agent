import express, { Application } from 'express';
import { settings } from '@elizaos/core';
import twitterRoutes from './routes/twitter.ts';
import agentRoutes from './routes/agents.ts';

const app = express();
const port = parseInt(settings.SERVER_PORT || '8080');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', agentRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: err.message 
  });
});

export function startServer(): Application {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  return app;
} 

// Start the server when this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
} 
