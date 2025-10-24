import { spawn } from 'child_process';
import { watch, mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MEDIA_ROOT = process.env.MEDIA_ROOT || '/opt/beiizetu-stream/media';

// Ensure directories exist
async function ensureDirectories() {
  try {
    await mkdir(join(MEDIA_ROOT, 'uploads'), { recursive: true });
    await mkdir(join(MEDIA_ROOT, 'hls'), { recursive: true });
    await mkdir(join(MEDIA_ROOT, 'meta'), { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
  }
}

// Update metadata status
async function updateMetadata(videoId: string, status: string) {
  try {
    const metaPath = join(MEDIA_ROOT, 'meta', `${videoId}.json`);
    const metadata = JSON.parse(await readFile(metaPath, 'utf8'));
    metadata.status = status;
    metadata.updatedAt = new Date().toISOString();
    
    await writeFile(metaPath, JSON.stringify(metadata, null, 2));
    
    // Optional: Update Firestore if configured
    if (process.env.FB_PROJECT_ID && process.env.FB_CLIENT_EMAIL && process.env.FB_PRIVATE_KEY) {
      try {
        const { getFirestore } = await import('firebase-admin/firestore');
        const db = getFirestore();
        await db.collection('videos').doc(videoId).update(metadata);
      } catch (error) {
        console.error('Error updating Firestore:', error);
      }
    }
  } catch (error) {
    console.error(`Error updating metadata for ${videoId}:`, error);
  }
}

// Transcode video to HLS
async function transcodeToHLS(videoId: string) {
  const inputPath = join(MEDIA_ROOT, 'uploads', `${videoId}.mp4`);
  const outputDir = join(MEDIA_ROOT, 'hls', videoId);
  
  // Create output directory
  await mkdir(outputDir, { recursive: true });
  
  // Update status to processing
  await updateMetadata(videoId, 'processing');
  
  console.log(`Starting transcoding for ${videoId}`);
  
  // FFmpeg command for multi-bitrate HLS
  const ffmpeg = spawn('ffmpeg', [
    '-i', inputPath,
    '-filter:v:0', 'scale=w=-2:h=1080', '-c:v:0', 'h264', '-b:v:0', '5000k', '-c:a:0', 'aac', '-b:a:0', '128k',
    '-filter:v:1', 'scale=w=-2:h=720', '-c:v:1', 'h264', '-b:v:1', '2800k', '-c:a:1', 'aac', '-b:a:1', '128k',
    '-filter:v:2', 'scale=w=-2:h=480', '-c:v:2', 'h264', '-b:v:2', '1400k', '-c:a:2', 'aac', '-b:a:2', '96k',
    '-filter:v:3', 'scale=w=-2:h=240', '-c:v:3', 'h264', '-b:v:3', '800k', '-c:a:3', 'aac', '-b:a:3', '64k',
    '-var_stream_map', 'v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3',
    '-hls_time', '6',
    '-hls_playlist_type', 'vod',
    '-hls_flags', 'independent_segments',
    '-master_pl_name', 'master.m3u8',
    '-hls_segment_filename', `${outputDir}/v%v/seg_%06d.ts`,
    `${outputDir}/v%v/index.m3u8`
  ]);
  
  // Create subdirectories for each variant
  await mkdir(join(outputDir, 'v0'), { recursive: true });
  await mkdir(join(outputDir, 'v1'), { recursive: true });
  await mkdir(join(outputDir, 'v2'), { recursive: true });
  await mkdir(join(outputDir, 'v3'), { recursive: true });
  
  // Handle FFmpeg output
  ffmpeg.stderr.on('data', (data) => {
    console.error(`FFmpeg stderr for ${videoId}:`, data.toString());
  });
  
  ffmpeg.on('close', (code) => {
    if (code === 0) {
      console.log(`Transcoding completed for ${videoId}`);
      updateMetadata(videoId, 'ready');
    } else {
      console.error(`Transcoding failed for ${videoId} with code ${code}`);
      updateMetadata(videoId, 'error');
    }
  });
  
  ffmpeg.on('error', (error) => {
    console.error(`FFmpeg error for ${videoId}:`, error);
    updateMetadata(videoId, 'error');
  });
}

// Watch for new uploads
async function watchForUploads() {
  const uploadsDir = join(MEDIA_ROOT, 'uploads');
  
  try {
    console.log(`Watching ${uploadsDir} for new uploads...`);
    
    // Process existing files
    const files = await watch(uploadsDir);
    
    for await (const event of files) {
      if (event.eventType === 'rename' && event.filename) {
        const filePath = join(uploadsDir, event.filename);
        
        // Check if it's a new MP4 file
        if (event.filename.endsWith('.mp4') && existsSync(filePath)) {
          const videoId = event.filename.replace('.mp4', '');
          
          // Check if already processed
          const metaPath = join(MEDIA_ROOT, 'meta', `${videoId}.json`);
          if (existsSync(metaPath)) {
            try {
              const metadata = JSON.parse(await readFile(metaPath, 'utf8'));
              
              // Only process if status is 'uploaded'
              if (metadata.status === 'uploaded') {
                transcodeToHLS(videoId);
              }
            } catch (error) {
              console.error(`Error reading metadata for ${videoId}:`, error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error watching uploads:', error);
  }
}

// Start the worker
async function startWorker() {
  await ensureDirectories();
  await watchForUploads();
}

startWorker().catch(console.error);