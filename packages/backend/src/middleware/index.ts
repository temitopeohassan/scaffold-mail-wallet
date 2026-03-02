import { Express } from 'express';
import { rateLimiter } from './rateLimiter';
import { requestLogger } from './requestLogger';
import { validateRequest } from './validation';

export function setupMiddleware(app: Express): void {
  // Request logging
  app.use(requestLogger);
  
  // Rate limiting
  app.use(rateLimiter);
}

export { rateLimiter, requestLogger, validateRequest };