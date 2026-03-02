import { getFirestore, getAuth, COLLECTIONS } from '../config/firebase';
import { logger } from '../utils/logger';
import { User, ActivateUserResponse } from '../types';
import { WalletService } from './walletService';

export class UserService {
  private walletService = new WalletService();

  async createUser(uid: string, email: string): Promise<User> {
    try {
      const userData: User = {
        uid,
        email,
        emailVerified: false,
        activated: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await firestore.collection(COLLECTIONS.USERS).doc(uid).set(userData);
      
      logger.info('User created successfully', { uid, email });
      return userData;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDoc = await firestore.collection(COLLECTIONS.USERS).doc(uid).get();
      
      if (!userDoc.exists) {
        // Try to get user from Firebase Auth and create profile
        try {
          const userRecord = await getAuth().getUser(uid);
          const userData = await this.createUser(uid, userRecord.email || '');
          return userData;
        } catch (authError) {
          logger.warn('User not found in Auth:', authError);
          return null;
        }
      }

      const data = userDoc.data();
      return {
        uid: data?.uid,
        email: data?.email,
        emailVerified: data?.emailVerified || false,
        walletAddress: data?.walletAddress,
        activated: data?.activated || false,
        createdAt: data?.createdAt?.toDate(),
        updatedAt: data?.updatedAt?.toDate()
      };
    } catch (error) {
      logger.error('Failed to get user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<User>): Promise<User> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date()
      };

      await firestore.collection(COLLECTIONS.USERS).doc(uid).update(updateData);
      
      // Get updated user data
      const updatedUser = await this.getUserProfile(uid);
      
      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user profile');
      }

      logger.info('User profile updated', { uid, updates: Object.keys(updates) });
      return updatedUser;
    } catch (error) {
      logger.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async activateUser(walletAddress: string): Promise<ActivateUserResponse> {
    try {
      // Validate wallet address format
      if (!await this.walletService.validateWalletAddress(walletAddress)) {
        return {
          success: false,
          message: 'Invalid wallet address format',
          walletAddress
        };
      }

      // Find user by wallet address
      const walletData = await this.walletService.getWalletByAddress(walletAddress);
      
      if (!walletData) {
        return {
          success: false,
          message: 'Wallet address not found',
          walletAddress
        };
      }

      // Update user activation status
      await firestore.collection(COLLECTIONS.USERS).doc(walletData.userId).update({
        activated: true,
        updatedAt: new Date()
      });

      logger.info('User activated successfully', {
        userId: walletData.userId,
        walletAddress
      });

      return {
        success: true,
        message: 'User activated successfully',
        walletAddress
      };
    } catch (error) {
      logger.error('Failed to activate user:', error);
      return {
        success: false,
        message: 'Failed to activate user',
        walletAddress
      };
    }
  }

  async deactivateUser(uid: string): Promise<void> {
    try {
      await firestore.collection(COLLECTIONS.USERS).doc(uid).update({
        activated: false,
        updatedAt: new Date()
      });

      logger.info('User deactivated', { uid });
    } catch (error) {
      logger.error('Failed to deactivate user:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      // Delete user document
      await firestore.collection(COLLECTIONS.USERS).doc(uid).delete();
      
      // Delete wallet document if exists
      const walletDoc = await firestore.collection(COLLECTIONS.WALLETS).doc(uid).get();
      if (walletDoc.exists) {
        await firestore.collection(COLLECTIONS.WALLETS).doc(uid).delete();
      }

      // Delete user from Firebase Auth
      await getAuth().deleteUser(uid);

      logger.info('User deleted completely', { uid });
    } catch (error) {
      logger.error('Failed to delete user:', error);
      throw error;
    }
  }

  async getUsersByStatus(activated: boolean): Promise<User[]> {
    try {
      const usersQuery = await firestore
        .collection(COLLECTIONS.USERS)
        .where('activated', '==', activated)
        .orderBy('createdAt', 'desc')
        .get();

      const users: User[] = [];
      usersQuery.forEach(doc => {
        const data = doc.data();
        users.push({
          uid: data.uid,
          email: data.email,
          emailVerified: data.emailVerified,
          walletAddress: data.walletAddress,
          activated: data.activated,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        });
      });

      return users;
    } catch (error) {
      logger.error('Failed to get users by status:', error);
      throw error;
    }
  }

  async updateEmailVerificationStatus(uid: string, verified: boolean): Promise<void> {
    try {
      await firestore.collection(COLLECTIONS.USERS).doc(uid).update({
        emailVerified: verified,
        updatedAt: new Date()
      });

      logger.info('Email verification status updated', { uid, verified });
    } catch (error) {
      logger.error('Failed to update email verification status:', error);
      throw error;
    }
  }
}