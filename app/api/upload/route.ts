// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile, writeFile as fsWriteFile } from "fs/promises";
import { join, extname } from "path";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

// Use VPS media dir (outside repo) so nginx /media alias can serve it
const MEDIA_ROOT = process.env.MEDIA_ROOT || "/opt/beiizetu-app/media";
const PUBLIC_VIDEOS_DIR = join(MEDIA_ROOT, "public-videos");
const META_DIR = join(MEDIA_ROOT, "meta");
const METADATA_FILE = join(META_DIR, "videos.json");

// Ensure directories exist
async function ensureDirectories() {
  try {
    await mkdir(PUBLIC_VIDEOS_DIR, { recursive: true });
    await mkdir(META_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
  }
}

// Read videos metadata
async function getVideosMetadata() {
  try {
    const data = await readFile(METADATA_FILE, "utf8");
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
    console.error("Error saving metadata:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDirectories();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "Untitled Video";
    const folderId = (formData.get("folderId") as string) || "root";
    const visibility = (formData.get("visibility") as string) || "private";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file type
    if (!file.type?.startsWith("video/")) {
      return NextResponse.json({ error: "Only video files are allowed" }, { status: 400 });
    }

    // Validate visibility
    if (!["public", "private", "role"].includes(visibility)) {
      return NextResponse.json({ error: "Invalid visibility option" }, { status: 400 });
    }

    // Generate unique ID and filename (normalize extension to lowercase)
    const videoId = uuidv4();
    const rawExt = extname((file as any).name || "mp4") || ".mp4";
    const ext = rawExt.toLowerCase().startsWith(".") ? rawExt.toLowerCase() : `.${rawExt.toLowerCase()}`;
    const fileName = `${videoId}${ext}`;
    const filePath = join(PUBLIC_VIDEOS_DIR, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Create metadata (store public /media path once)
    const videoMetadata = {
      id: videoId,
      title,
      fileName,
      folderId,
      sizeBytes: buffer.length,
      mimeType: file.type,
      status: "ready",
      visibility,
      url: `/media/${fileName}`, // <-- nginx serves this prefix
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save metadata
    const videos = await getVideosMetadata();
    videos.push(videoMetadata);
    await saveVideosMetadata(videos);

    console.log(
      `API: Successfully uploaded video: ${title} (${videoId}) with visibility: ${visibility}`
    );

    return NextResponse.json({
      success: true,
      videoId,
      title: videoMetadata.title,
      visibility: videoMetadata.visibility,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload video",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
