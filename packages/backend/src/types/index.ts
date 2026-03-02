import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
  };
}

export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  walletAddress?: string;
  activated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletData {
  userId: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerateWalletRequest {
  userId: string;
}

export interface GenerateWalletResponse {
  walletAddress: string;
  privateKey: string;
  mnemonic: string;
}

export interface VerifyEmailRequest {
  email: string;
  verificationCode: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface StoreWalletAddressRequest {
  userId: string;
  walletAddress: string;
}

export interface ActivateUserRequest {
  walletAddress: string;
}

export interface ActivateUserResponse {
  success: boolean;
  message: string;
  walletAddress: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface WalletCreationModalStep {
  step: number;
  title: string;
  content: string;
  buttonText: string;
}

export interface SecurityReminder {
  title: string;
  points: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}