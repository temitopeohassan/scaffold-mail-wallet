import { Request, Response, NextFunction } from 'express';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { logger } from '../utils/logger';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
  duration: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900', 10),
});

export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    await rateLimiter.consume(clientIp);
    next();
  } catch (rejRes: unknown) {
    const msBeforeNext = typeof rejRes === 'object' && rejRes !== null && 'msBeforeNext' in rejRes
      ? (rejRes as { msBeforeNext: number }).msBeforeNext
      : 1000;
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.round(msBeforeNext / 1000) || 1,
    });
  }
};

export { rateLimiterMiddleware as rateLimiter };