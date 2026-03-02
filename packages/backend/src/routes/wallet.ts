import { Router } from 'express';
import { authenticateToken, requireEmailVerification } from '../middleware/auth';
import { validateRequest, schemas } from '../middleware/validation';
import { WalletService } from '../services/walletService';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types';

const router = Router();
const walletService = new WalletService();

// Generate new wallet
router.post(
  '/generate',
  authenticateToken,
  requireEmailVerification,
  validateRequest(schemas.generateWallet),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { userId } = req.body;
      
      // Ensure the authenticated user matches the request
      if (req.user?.uid !== userId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'User ID mismatch'
        });
        return;
      }

      const walletData = await walletService.generateWallet(userId);
      
      logger.info('Wallet generated successfully', {
        userId,
        walletAddress: walletData.walletAddress
      });

      res.json({
        success: true,
        data: walletData,
        message: 'Wallet generated successfully'
      });
    } catch (error) {
      logger.error('Failed to generate wallet:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to generate wallet'
      });
    }
  }
);

// Store wallet address
router.post(
  '/store-address',
  authenticateToken,
  requireEmailVerification,
  validateRequest(schemas.storeWalletAddress),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, walletAddress } = req.body;
      
      // Ensure the authenticated user matches the request
      if (req.user?.uid !== userId) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'User ID mismatch'
        });
        return;
      }

      await walletService.storeWalletAddress(userId, walletAddress);
      
      logger.info('Wallet address stored successfully', {
        userId,
        walletAddress
      });

      res.json({
        success: true,
        message: 'Wallet address stored successfully'
      });
    } catch (error) {
      logger.error('Failed to store wallet address:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to store wallet address'
      });
    }
  }
);

// Get wallet info
router.get(
  '/info',
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

      const walletInfo = await walletService.getWalletInfo(userId);
      
      if (!walletInfo) {
        res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Wallet not found for this user'
        });
        return;
      }

      res.json({
        success: true,
        data: walletInfo,
        message: 'Wallet info retrieved successfully'
      });
    } catch (error) {
      logger.error('Failed to get wallet info:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to retrieve wallet info'
      });
    }
  }
);

export default router;