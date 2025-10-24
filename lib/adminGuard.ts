import { headers } from 'next/headers';
import admin from 'firebase-admin';

// Initialize Firebase Admin if credentials are provided
let firebaseAdmin: typeof admin | null = null;

if (
  process.env.FB_PROJECT_ID &&
  process.env.FB_CLIENT_EMAIL &&
  process.env.FB_PRIVATE_KEY
) {
  try {
    const serviceAccount = {
      projectId: process.env.FB_PROJECT_ID,
      clientEmail: process.env.FB_CLIENT_EMAIL,
      privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

/**
 * Require admin authentication
 * @param reqHeaders Request headers
 * @returns User ID if authenticated, null otherwise
 */
export async function requireAdmin(reqHeaders: Headers): Promise<{ uid: string } | null> {
  try {
    // If Firebase Admin is configured, verify Firebase ID token
    if (firebaseAdmin) {
      const authHeader = reqHeaders.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }
      
      const token = authHeader.substring(7);
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
      
      // Check if user has admin role
      if (decodedToken.roles && decodedToken.roles.includes('admin')) {
        return { uid: decodedToken.uid };
      }
      
      return null;
    }
    
    // Development bypass: accept x-dev-admin header
    // WARNING: This should be disabled in production
    if (process.env.NODE_ENV === 'development') {
      const devAdminHeader = reqHeaders.get('x-dev-admin');
      if (devAdminHeader === '1') {
        return { uid: 'dev-admin' };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error in admin guard:', error);
    return null;
  }
}