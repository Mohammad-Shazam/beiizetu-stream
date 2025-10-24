import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const METADATA_FILE = join(process.cwd(), 'data', 'videos.json');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    console.log(`API: Getting video with ID: ${videoId}`);

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

    console.log(`API: Found video: ${video.title}`);
    return NextResponse.json({ video });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    const updates = await request.json();
    console.log(`API: Updating video ${videoId} with:`, updates);

    // Read videos metadata
    let videos = [];
    try {
      const data = await readFile(METADATA_FILE, 'utf8');
      videos = JSON.parse(data);
    } catch (error) {
      console.log('API: No videos file found');
      return NextResponse.json({ error: 'Videos not found' }, { status: 404 });
    }

    // Find and update the video
    const videoIndex = videos.findIndex((v: any) => v.id === videoId);
    if (videoIndex === -1) {
      console.log(`API: Video with ID ${videoId} not found`);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Update the video
    videos[videoIndex] = {
      ...videos[videoIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Save updated metadata
    await writeFile(METADATA_FILE, JSON.stringify(videos, null, 2));
    console.log(`API: Successfully updated video ${videoId}`);

    return NextResponse.json({ video: videos[videoIndex] });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to update video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    console.log(`API: Deleting video with ID: ${videoId}`);

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
    const videoIndex = videos.findIndex((v: any) => v.id === videoId);
    if (videoIndex === -1) {
      console.log(`API: Video with ID ${videoId} not found`);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = videos[videoIndex];
    
    // Remove the video from the array
    videos.splice(videoIndex, 1);
    
    // Save updated metadata
    await writeFile(METADATA_FILE, JSON.stringify(videos, null, 2));
    
    // Delete the actual video file
    try {
      const { unlink } = await import('fs/promises');
      const videoPath = join(process.cwd(), 'public', 'videos', video.fileName);
      await unlink(videoPath);
      console.log(`API: Deleted video file: ${videoPath}`);
    } catch (fileError) {
      console.error(`API: Failed to delete video file:`, fileError);
      // Continue even if file deletion fails
    }

    console.log(`API: Successfully deleted video ${videoId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}