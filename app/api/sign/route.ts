import { NextRequest, NextResponse } from 'next/server';
import { access } from 'fs/promises';
import { join } from 'path';
import { sign } from '@/lib/sec';

const MEDIA_ROOT = process.env.MEDIA_ROOT || '/opt/beiizetu-app/media';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('id');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    // Check if HLS master playlist exists
    const masterPlaylistPath = join(MEDIA_ROOT, 'hls', videoId, 'master.m3u8');
    
    try {
      await access(masterPlaylistPath);
    } catch (error) {
      return NextResponse.json({ error: 'Video not ready' }, { status: 409 });
    }

    // Generate signed URL (valid for 10 minutes)
    const signedUrl = sign(`/hls/${videoId}/master.m3u8`, 600);
    
    // Return full URL with domain
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
    const fullUrl = `${domain}${signedUrl}`;

    return NextResponse.json({ url: fullUrl });
  } catch (error) {
    console.error('Sign URL error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}