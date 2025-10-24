import { headers } from 'next/headers';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import jwt from 'jsonwebtoken';

// Initialize Firebase Admin if credentials are provided
let firebaseAdmin: ReturnType<typeof getAuth> | null = null;

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
    
    const app = initializeApp({
      credential: cert(serviceAccount),
    });
    
    firebaseAdmin = getAuth(app);
    
    console.log('Firebase Admin initialized');
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

// Simple JWT secret for development
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';

import { NextRequest } from 'next/server';

export async function auth(request: NextRequest) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, error: 'No authorization header' };
    }

    const token = authHeader.substring(7);

    // Try Firebase Auth first
    if (firebaseAdmin) {
      try {
        const decodedToken = await firebaseAdmin.verifyIdToken(token);
        return { success: true, user: decodedToken };
      } catch (firebaseError) {
        console.log('Firebase auth failed, trying JWT');
      }
    }

    // Fallback to JWT verification
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return { success: true, user: decoded };
    } catch (jwtError) {
      return { success: false, error: 'Invalid token' };
    }
  } catch (error) {
    console.error('Auth error:', error);
    return { success: false, error: 'Authentication failed' };
  }
}