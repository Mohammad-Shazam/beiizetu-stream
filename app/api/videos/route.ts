import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const METADATA_FILE = join(process.cwd(), 'data', 'videos.json');

export async function GET(request: NextRequest) {
  try {
    console.log('API: Videos endpoint called');
    
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const q = searchParams.get('q');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');

    console.log('API: Received params:', { folderId, q, status, visibility });

    // Read videos metadata
    let videos = [];
    try {
      const data = await readFile(METADATA_FILE, 'utf8');
      videos = JSON.parse(data);
      console.log('API: Successfully read', videos.length, 'videos');
    } catch (error) {
      console.log('API: No videos file found, creating empty one');
      // Create empty file if it doesn't exist
      await writeFile(METADATA_FILE, JSON.stringify([], null, 2));
      videos = [];
    }

    // Filter by folder
    if (folderId && folderId !== 'all') {
      const beforeFilter = videos.length;
      videos = videos.filter((video: any) => video.folderId === folderId);
      console.log(`API: Filtered by folderId "${folderId}": ${beforeFilter} -> ${videos.length}`);
    }

    // Filter by search query
    if (q) {
      const beforeFilter = videos.length;
      videos = videos.filter((video: any) => 
        video.title.toLowerCase().includes(q.toLowerCase())
      );
      console.log(`API: Filtered by query "${q}": ${beforeFilter} -> ${videos.length}`);
    }

    // Filter by status
    if (status && status !== 'all') {
      const beforeFilter = videos.length;
      videos = videos.filter((video: any) => video.status === status);
      console.log(`API: Filtered by status "${status}": ${beforeFilter} -> ${videos.length}`);
    }

    // Filter by visibility
    if (visibility && visibility !== 'all') {
      const beforeFilter = videos.length;
      videos = videos.filter((video: any) => video.visibility === visibility);
      console.log(`API: Filtered by visibility "${visibility}": ${beforeFilter} -> ${videos.length}`);
    }

    // Sort by creation date (newest first)
    videos.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log('API: Returning', videos.length, 'videos');

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch videos',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}