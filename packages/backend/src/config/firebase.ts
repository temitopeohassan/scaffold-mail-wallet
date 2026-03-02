import admin from 'firebase-admin';
import { logger } from '../utils/logger';

export async function initializeFirebase(): Promise<void> {
  try {
    if (admin.apps.length > 0) {
      logger.info('Firebase already initialized');
      return;
    }

    const projectId = process.env['FIREBASE_PROJECT_ID'];
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env['FIREBASE_PROJECT_ID'],
      private_key_id: process.env['FIREBASE_PRIVATE_KEY_ID'],
      private_key: process.env['FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n'),
      client_email: process.env['FIREBASE_CLIENT_EMAIL'],
      client_id: process.env['FIREBASE_CLIENT_ID'],
      auth_uri: process.env['FIREBASE_AUTH_URI'],
      token_uri: process.env['FIREBASE_TOKEN_URI'],
      auth_provider_x509_cert_url: process.env['FIREBASE_AUTH_PROVIDER_X509_CERT_URL'],
      client_x509_cert_url: process.env['FIREBASE_CLIENT_X509_CERT_URL'],
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      ...(projectId && { projectId }),
    });

    logger.info('Firebase Admin SDK initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

/** Use after initializeFirebase() has been called. */
export function getAuth(): admin.auth.Auth {
  return admin.auth();
}

/** Use after initializeFirebase() has been called. */
export function getFirestore(): admin.firestore.Firestore {
  return admin.firestore();
}

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  WALLETS: 'wallets',
  TRANSACTIONS: 'transactions',
} as const;