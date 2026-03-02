import { ethers } from 'ethers';
import * as bip39 from 'bip39';
import { getFirestore, COLLECTIONS } from '../config/firebase';
import { logger } from '../utils/logger';
import { GenerateWalletResponse, WalletData } from '../types';

export class WalletService {
  async generateWallet(userId: string): Promise<GenerateWalletResponse> {
    try {
      // Check if user already has a wallet
      const existingWallet = await this.getWalletInfo(userId);
      if (existingWallet) {
        throw new Error('User already has a wallet');
      }

      // Generate mnemonic
      const mnemonic = bip39.generateMnemonic();
      
      // Create wallet from mnemonic
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      
      const walletData: GenerateWalletResponse = {
        walletAddress: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: mnemonic
      };

      logger.info('Wallet generated', {
        userId,
        walletAddress: wallet.address
      });

      return walletData;
    } catch (error) {
      logger.error('Failed to generate wallet:', error);
      throw error;
    }
  }

  async storeWalletAddress(userId: string, walletAddress: string): Promise<void> {
    try {
      // Validate Ethereum address format
      if (!ethers.isAddress(walletAddress)) {
        throw new Error('Invalid Ethereum address');
      }

      const walletData: Omit<WalletData, 'updatedAt'> = {
        userId,
        walletAddress,
        createdAt: new Date()
      };

      // Store wallet address in Firestore (never store private key)
      await getFirestore().collection(COLLECTIONS.WALLETS).doc(userId).set({
        ...walletData,
        updatedAt: new Date()
      });

      // Update user document with wallet address
      await getFirestore().collection(COLLECTIONS.USERS).doc(userId).update({
        walletAddress,
        updatedAt: new Date()
      });

      logger.info('Wallet address stored successfully', {
        userId,
        walletAddress
      });
    } catch (error) {
      logger.error('Failed to store wallet address:', error);
      throw error;
    }
  }

  async getWalletInfo(userId: string): Promise<WalletData | null> {
    try {
      const walletDoc = await firestore
        .collection(COLLECTIONS.WALLETS)
        .doc(userId)
        .get();

      if (!walletDoc.exists) {
        return null;
      }

      const data = walletDoc.data();
      return {
        userId: data?.userId,
        walletAddress: data?.walletAddress,
        createdAt: data?.createdAt?.toDate(),
        updatedAt: data?.updatedAt?.toDate()
      };
    } catch (error) {
      logger.error('Failed to get wallet info:', error);
      throw error;
    }
  }

  async validateWalletAddress(address: string): Promise<boolean> {
    return ethers.isAddress(address);
  }

  async getWalletByAddress(walletAddress: string): Promise<WalletData | null> {
    try {
      const walletQuery = await firestore
        .collection(COLLECTIONS.WALLETS)
        .where('walletAddress', '==', walletAddress)
        .limit(1)
        .get();

      if (walletQuery.empty) {
        return null;
      }

      const doc = walletQuery.docs[0];
      const data = doc.data();
      
      return {
        userId: data.userId,
        walletAddress: data.walletAddress,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    } catch (error) {
      logger.error('Failed to get wallet by address:', error);
      throw error;
    }
  }

  // Utility method to generate wallet creation modal content
  getModalContent(step: number, walletData?: GenerateWalletResponse): any {
    const modalSteps = {
      1: {
        step: 1,
        title: 'Wallet Created Successfully! 🎉',
        content: `Your Ethereum wallet has been generated. Your wallet address is: ${walletData?.walletAddress}`,
        buttonText: 'Secure My Private Key'
      },
      2: {
        step: 2,
        title: 'Save Your Private Key 🔐',
        content: `⚠️ CRITICAL: Save your private key securely. This is the ONLY time it will be shown. Private Key: ${walletData?.privateKey}`,
        buttonText: 'I Have Saved It Securely'
      },
      3: {
        step: 3,
        title: 'Save Your Recovery Phrase 📝',
        content: `Also save your 12-word recovery phrase: ${walletData?.mnemonic}`,
        buttonText: 'Complete Setup'
      }
    };

    return modalSteps[step as keyof typeof modalSteps] || null;
  }

  // Security reminders for private key storage
  getSecurityReminders(): any {
    return {
      title: 'Critical Security Information',
      points: [
        'Never share your private key with anyone',
        'Store your private key offline in a secure location',
        'Consider using a hardware wallet for large amounts',
        'Make multiple backup copies of your recovery phrase',
        'Never store private keys in cloud storage or email'
      ],
      severity: 'critical' as const
    };
  }
}