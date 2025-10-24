import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const METADATA_FILE = join(process.cwd(), 'data', 'videos.json');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    console.log(`API: Generating signed URL for video ID: ${videoId}`);

    // Read videos metadata
    let videos = [];
    try {
      const data = await readFile(METADATA_FILE, 'utf8');
      videos = JSON.parse(data);
    } catch (error) {
      console.log('API: No videos file found');
      return NextResponse.json({ error: 'Videos not found' }, { status: 404 });
    }

    // Find the video
    const video = videos.find((v: any) => v.id === videoId);
    
    if (!video) {
      console.log(`API: Video with ID ${videoId} not found`);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.status !== 'ready') {
      console.log(`API: Video ${videoId} is not ready (status: ${video.status})`);
      return NextResponse.json({ error: 'Video not ready' }, { status: 409 });
    }

    // Generate video URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const videoUrl = `${baseUrl}/videos/${video.fileName}`;

    console.log(`API: Generated URL for video ${videoId}: ${videoUrl}`);

    return NextResponse.json({ 
      url: videoUrl,
      videoId,
      title: video.title,
      fileName: video.fileName
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}