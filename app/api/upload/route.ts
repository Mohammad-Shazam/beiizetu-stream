import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { requireAdmin } from '@/lib/adminGuard';
import { v4 as uuidv4 } from 'uuid';

const MEDIA_ROOT = process.env.MEDIA_ROOT || '/opt/beiizetu-app/media';

export async function POST(request: NextRequest) {
  try {
    // Check admin permissions
    const headersList = headers();
    const admin = await requireAdmin(headersList);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || 'Untitled Video';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate video ID
    const videoId = uuidv4();
    
    // Ensure directories exist
    const uploadsDir = join(MEDIA_ROOT, 'uploads');
    const metaDir = join(MEDIA_ROOT, 'meta');
    
    try {
      await mkdir(uploadsDir, { recursive: true });
      await mkdir(metaDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directories:', error);
      return NextResponse.json({ error: 'Failed to create directories' }, { status: 500 });
    }

    // Save file
    const filePath = join(uploadsDir, `${videoId}.mp4`);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
    }

    // Create metadata
    const metadata = {
      videoId,
      title,
      status: 'uploaded',
      createdAt: new Date().toISOString(),
      sizeBytes: buffer.length,
    };

    // Save metadata
    const metaPath = join(metaDir, `${videoId}.json`);
    try {
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Error saving metadata:', error);
      return NextResponse.json({ error: 'Failed to save metadata' }, { status: 500 });
    }

    // Optional: Save to Firestore if configured
    if (process.env.FB_PROJECT_ID && process.env.FB_CLIENT_EMAIL && process.env.FB_PRIVATE_KEY) {
      try {
        const { getFirestore } = await import('firebase-admin/firestore');
        const db = getFirestore();
        await db.collection('videos').doc(videoId).set(metadata);
      } catch (error) {
        console.error('Error saving to Firestore:', error);
        // Continue even if Firestore fails
      }
    }

    return NextResponse.json({ videoId });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}