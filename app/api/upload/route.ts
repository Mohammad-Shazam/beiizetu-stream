import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, writeFile as fsWriteFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const VIDEOS_DIR = join(process.cwd(), 'public', 'videos');
const METADATA_FILE = join(process.cwd(), 'data', 'videos.json');

// Ensure directories exist
async function ensureDirectories() {
  try {
    await mkdir(VIDEOS_DIR, { recursive: true });
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Read videos metadata
async function getVideosMetadata() {
  try {
    const data = await readFile(METADATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save videos metadata
async function saveVideosMetadata(videos: any[]) {
  try {
    await fsWriteFile(METADATA_FILE, JSON.stringify(videos, null, 2));
  } catch (error) {
    console.error('Error saving metadata:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || 'Untitled Video';
    const folderId = formData.get('folderId') as string || 'root';
    const visibility = formData.get('visibility') as string || 'private';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json({ error: 'Only video files are allowed' }, { status: 400 });
    }

    // Validate visibility
    if (!['public', 'private', 'role'].includes(visibility)) {
      return NextResponse.json({ error: 'Invalid visibility option' }, { status: 400 });
    }

    // Generate unique ID and filename
    const videoId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${videoId}.${fileExtension}`;
    const filePath = join(VIDEOS_DIR, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create metadata
    const videoMetadata = {
      id: videoId,
      title,
      fileName,
      folderId,
      sizeBytes: buffer.length,
      mimeType: file.type,
      status: 'ready',
      visibility, // Use the visibility from form
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save metadata
    const videos = await getVideosMetadata();
    videos.push(videoMetadata);
    await saveVideosMetadata(videos);

    console.log(`API: Successfully uploaded video: ${title} (${videoId}) with visibility: ${visibility}`);

    return NextResponse.json({ 
      success: true,
      videoId,
      title: videoMetadata.title,
      visibility: videoMetadata.visibility
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload video',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}