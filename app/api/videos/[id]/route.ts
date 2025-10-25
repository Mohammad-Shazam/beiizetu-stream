import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const MEDIA_ROOT = process.env.MEDIA_ROOT || "/opt/beiizetu-app/media";
const META_DIR = join(MEDIA_ROOT, "meta");
const METADATA_FILE = join(META_DIR, "videos.json");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    console.log(`API: Getting video with ID: ${videoId}`);

    let videos: any[] = [];
    try {
      const data = await readFile(METADATA_FILE, "utf8");
      videos = JSON.parse(data);
    } catch {
      console.log("API: No videos file found");
      return NextResponse.json({ error: "Videos not found" }, { status: 404 });
    }

    const video = videos.find((v: any) => v.id === videoId);
    if (!video) {
      console.log(`API: Video with ID ${videoId} not found`);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    console.log(`API: Found video: ${video.title}`);
    return NextResponse.json({ video });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch video", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
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

    let videos: any[] = [];
    try {
      const data = await readFile(METADATA_FILE, "utf8");
      videos = JSON.parse(data);
    } catch {
      console.log("API: No videos file found");
      return NextResponse.json({ error: "Videos not found" }, { status: 404 });
    }

    const idx = videos.findIndex((v: any) => v.id === videoId);
    if (idx === -1) {
      console.log(`API: Video with ID ${videoId} not found`);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    videos[idx] = { ...videos[idx], ...updates, updatedAt: new Date().toISOString() };
    await writeFile(METADATA_FILE, JSON.stringify(videos, null, 2));
    console.log(`API: Successfully updated video ${videoId}`);

    return NextResponse.json({ video: videos[idx] });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to update video", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    console.log(`API: Deleting video with ID: ${videoId}`);

    let videos: any[] = [];
    try {
      const data = await readFile(METADATA_FILE, "utf8");
      videos = JSON.parse(data);
    } catch {
      console.log("API: No videos file found");
      return NextResponse.json({ error: "Videos not found" }, { status: 404 });
    }

    const videoIndex = videos.findIndex((v: any) => v.id === videoId);
    if (videoIndex === -1) {
      console.log(`API: Video with ID ${videoId} not found`);
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const video = videos[videoIndex];
    videos.splice(videoIndex, 1);
    await writeFile(METADATA_FILE, JSON.stringify(videos, null, 2));

    // Best-effort delete of the file itself (if you want to keep it)
    try {
      const { unlink } = await import("fs/promises");
      const PUBLIC_VIDEOS_DIR = join(process.env.MEDIA_ROOT || "/opt/beiizetu-app/media", "public-videos");
      await unlink(join(PUBLIC_VIDEOS_DIR, video.fileName));
      console.log(`API: Deleted video file: ${join(PUBLIC_VIDEOS_DIR, video.fileName)}`);
    } catch (fileError) {
      console.error("API: Failed to delete video file:", fileError);
    }

    console.log(`API: Successfully deleted video ${videoId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to delete video", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
