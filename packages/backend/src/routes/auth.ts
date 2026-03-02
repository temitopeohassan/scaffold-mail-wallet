import { Router } from 'express';
import { validateRequest, schemas } from '../middleware/validation';
import { AuthService } from '../services/authService';
import { logger } from '../utils/logger';

const router = Router();
const authService = new AuthService();

// Verify email
router.post(
  '/verify-email',
  validateRequest(schemas.verifyEmail),
  async (req, res) => {
    try {
      const { email, verificationCode } = req.body;

      const result = await authService.verifyEmail(email, verificationCode);
      
      logger.info('Email verification attempted', {
        email,
        success: result.success
      });

      res.json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      logger.error('Email verification failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to verify email'
      });
    }
  }
);

// Refresh token endpoint
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Refresh token is required'
      });
      return;
    }

    const result = await authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: result,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    logger.error('Token refresh failed:', error);
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid refresh token'
    });
  }
});

export default router;