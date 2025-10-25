import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

const MEDIA_ROOT = process.env.MEDIA_ROOT || "/opt/beiizetu-app/media";
const META_DIR = join(MEDIA_ROOT, "meta");
const METADATA_FILE = join(META_DIR, "videos.json");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;
    console.log(`API: Generating signed URL for video ID: ${videoId}`);

    let videos: any[] = [];
    try {
      const data = await readFile(METADATA_FILE, "utf8");
      videos = JSON.parse(data);
    } catch {
      console.log("API: No videos file found");
      return NextResponse.json({ error: "Videos not found" }, { status: 404 });
    }

    const video = videos.find((v: any) => v.id === videoId);
    if (!video) return NextResponse.json({ error: "Video not found" }, { status: 404 });
    if (video.status !== "ready")
      return NextResponse.json({ error: "Video not ready" }, { status: 409 });

    const proto =
      request.headers.get("x-forwarded-proto") ??
      (request.headers.get("host")?.includes("localhost") ? "http" : "https");
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    const baseUrl = `${proto}://${host}`;

    // Use stored public url or build from /media/<fileName>
    const publicPath = video.url || `/media/${video.fileName}`;
    const videoUrl = publicPath.startsWith("http") ? publicPath : `${baseUrl}${publicPath}`;

    console.log(`API: Generated URL for video ${videoId}: ${videoUrl}`);

    return NextResponse.json({
      url: videoUrl,
      videoId,
      title: video.title,
      fileName: video.fileName,
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate URL", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
