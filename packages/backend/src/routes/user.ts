import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types';

const router = Router();
const userService = new UserService();

// Get user profile
router.get(
  '/profile',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.uid;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'User ID not found'
        });
        return;
      }

      const userProfile = await userService.getUserProfile(userId);
      
      if (!userProfile) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'User profile not found'
        });
        return;
      }

      res.json({
        success: true,
        data: userProfile,
        message: 'User profile retrieved successfully'
      });
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve user profile'
      });
    }
  }
);

// Activate user
router.post(
  '/activate',
  validateRequest(schemas.activateUser),
  async (req, res) => {
    try {
      const { walletAddress } = req.body;

      const result = await userService.activateUser(walletAddress);
      
      logger.info('User activation attempted', {
        walletAddress,
        success: result.success
      });

      res.json(result);
    } catch (error) {
      logger.error('User activation failed:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to activate user'
      });
    }
  }
);

// Update user profile
router.put(
  '/profile',
  authenticateToken,
  async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user?.uid;
      const updates = req.body;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'User ID not found'
        });
        return;
      }

      // Remove sensitive fields that shouldn't be updated directly
      const allowedUpdates = ['displayName', 'photoURL'];
      const filteredUpdates: any = {};
      
      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          filteredUpdates[key] = updates[key];
        }
      });

      const updatedProfile = await userService.updateUserProfile(userId, filteredUpdates);
      
      logger.info('User profile updated', {
        userId,
        updates: Object.keys(filteredUpdates)
      });

      res.json({
        success: true,
        data: updatedProfile,
        message: 'User profile updated successfully'
      });
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to update user profile'
      });
    }
  }
);

export default router;