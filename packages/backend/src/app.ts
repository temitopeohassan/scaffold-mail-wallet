import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import serverless from 'serverless-http';
import { initializeFirebase } from './config/firebase';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';

/**
 * Creates and configures the Express app (used by both standalone server and Vercel serverless).
 */
export async function createApp(): Promise<Express> {
  await initializeFirebase();
  logger.info('Firebase initialized successfully');

  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  setupMiddleware(app);
  setupRoutes(app);

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env['NODE_ENV'],
    });
  });

  app.use(errorHandler);

  return app;
}

let cachedHandler: ReturnType<typeof serverless> | null = null;

/**
 * Default export for Vercel serverless: must be a function so the runtime accepts this module as the handler.
 */
export default async function handler(
  req: import('express').Request,
  res: import('express').Response
): Promise<unknown> {
  if (!cachedHandler) {
    const app = await createApp();
    cachedHandler = serverless(app);
  }
  return cachedHandler(req, res);
}
