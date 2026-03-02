import dotenv from 'dotenv';
import { createApp } from './app';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env['PORT'] || 5000;

async function startServer() {
  try {
    const app = await createApp();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env['NODE_ENV']}`);
      logger.info(`CORS Origin: ${process.env['CORS_ORIGIN']}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

startServer();