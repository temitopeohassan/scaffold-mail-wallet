#!/usr/bin/env node

import dotenv from 'dotenv';
import { initializeFirebase } from '../config/firebase';
import { UserService } from '../services/userService';
import { logger } from '../utils/logger';

// Load environment variables
dotenv.config();

async function activateUser() {
  try {
    // Get wallet address from command line arguments
    const walletAddress = process.argv[2];

    if (!walletAddress) {
      console.error('Usage: npm run activate-user <wallet-address>');
      console.error('Example: npm run activate-user 0x7a922963AB500f405ECA43f4ee2Fc2FDC891a94C');
      process.exit(1);
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      console.error('Error: Invalid Ethereum wallet address format');
      console.error('Wallet address should be in format: 0x followed by 40 hexadecimal characters');
      process.exit(1);
    }

    console.log(`Activating user with wallet address: ${walletAddress}`);

    // Initialize Firebase
    await initializeFirebase();
    logger.info('Firebase initialized for user activation script');

    // Create user service instance
    const userService = new UserService();

    // Activate user
    const result = await userService.activateUser(walletAddress);

    if (result.success) {
      console.log(`✅ Success: ${result.message}`);
      console.log(`Wallet Address: ${result.walletAddress}`);
      logger.info('User activation script completed successfully', {
        walletAddress: result.walletAddress
      });
    } else {
      console.error(`❌ Error: ${result.message}`);
      logger.error('User activation script failed', {
        walletAddress,
        message: result.message
      });
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Activation failed:', error);
    logger.error('User activation script error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nScript interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nScript terminated');
  process.exit(0);
});

// Run the script
activateUser();