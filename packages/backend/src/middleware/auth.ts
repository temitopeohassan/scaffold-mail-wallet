import { Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase';
import { logger } from '../utils/logger';
import { AuthenticatedRequest } from '../types';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'No token provided'
      });
      return;
    }

    // Verify Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      ...(decodedToken.email !== undefined && { email: decodedToken.email }),
      ...(decodedToken.email_verified !== undefined && { email_verified: decodedToken.email_verified }),
    };

    logger.info('User authenticated', {
      uid: decodedToken.uid,
      email: decodedToken.email
    });

    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }
};

export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user?.email_verified) {
    res.status(403).json({
      success: false,
      error: 'Email Not Verified',
      message: 'Please verify your email address before proceeding'
    });
    return;
  }
  
  next();
};