// app/videos/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVideo, generateSignedUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, EyeOff, Users, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Video } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";

export default function VideoPlayerPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadVideo() {
    try {
      const v = await getVideo(id as string);
      if (v) {
        setVideo(v);

        if ((v.status || "uploaded") === "ready") {
          const url = await generateSignedUrl(v.id); // this must return the API's `url` string
          setVideoUrl(url);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load video",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const getVisibilityIcon = (v: string) => {
    switch (v) {
      case "public":
        return <Globe className="h-4 w-4" />;
      case "private":
        return <EyeOff className="h-4 w-4" />;
      case "role":
        return <Users className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!video) {
    return <div className="p-6">Video not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{video.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {video.status === "ready" && videoUrl ? (
                <video
                  controls
                  preload="metadata"
                  className="w-full aspect-video"
                  src={videoUrl} // 👈 use the API-returned URL verbatim (e.g. /media/<fileName>.mp4)
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-medium">Video not ready</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {video.status || "uploaded"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {video.description && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground">{video.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Video Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge
                    variant={(video.status || "uploaded") === "ready" ? "default" : "outline"}
                  >
                    {video.status || "uploaded"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Visibility</span>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getVisibilityIcon(video.visibility || "private")}
                    {video.visibility || "private"}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File size</span>
                    <span>
                      {video.sizeBytes ? Math.round(video.sizeBytes / 1024 / 1024) : 0} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span>{video.fileName?.split(".").pop()?.toUpperCase() || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded</span>
                    <span>{new Date(video.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded by</span>
                    <span>{video.uploadedBy || user?.displayName || "Unknown"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
