import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      logger.warn('Validation error:', {
        path: req.path,
        error: error.details,
        body: req.body
      });
      
      res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.details.map(detail => detail.message).join(', '),
        details: error.details
      });
      return;
    }
    
    req.body = value;
    next();
  };
};

// Common validation schemas
export const schemas = {
  generateWallet: Joi.object({
    userId: Joi.string().required().min(1).max(128)
  }),
  
  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    verificationCode: Joi.string().required().min(4).max(10)
  }),
  
  storeWalletAddress: Joi.object({
    userId: Joi.string().required().min(1).max(128),
    walletAddress: Joi.string().required().pattern(/^0x[a-fA-F0-9]{40}$/)
      .message('Invalid Ethereum address format')
  }),
  
  activateUser: Joi.object({
    walletAddress: Joi.string().required().pattern(/^0x[a-fA-F0-9]{40}$/)
      .message('Invalid Ethereum address format')
  })
};