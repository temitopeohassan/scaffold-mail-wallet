import { Express } from 'express';
import walletRoutes from './wallet';
import authRoutes from './auth';
import userRoutes from './user';

export function setupRoutes(app: Express): void {
  // API routes
  app.use('/api/v1/wallet', walletRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/user', userRoutes);
  
  // Catch-all route for undefined endpoints
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      error: 'Not Found',
      message: `Route ${req.originalUrl} not found`
    });
  });
}