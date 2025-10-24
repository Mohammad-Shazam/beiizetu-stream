// components/dashboard/recent-uploads.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, Link2, RefreshCw } from "lucide-react"
import { listVideos } from "@/lib/api"
import { Video, VideoStatus } from "@/lib/types"

function StatusBadge({ s }: { s: VideoStatus }) {
  const map = {
    uploaded: { label: "Uploaded", variant: "secondary" as const },
    processing: { label: "Processing", variant: "outline" as const },
    ready: { label: "Ready", variant: "default" as const },
    error: { label: "Error", variant: "destructive" as const },
  } as const
  const { label, variant } = map[s] || map.uploaded
  return <Badge variant={variant}>{label}</Badge>
}

export function RecentUploads() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVideos() {
      try {
        const videoList = await listVideos({})
        // Sort by creation date, newest first
        const sortedVideos = videoList.sort((a, b) =>
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )
        setVideos(sortedVideos.slice(0, 5)) // Show only 5 most recent
      } catch (error) {
        console.error('Failed to load recent videos:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadVideos()
  }, [])

  function formatSize(bytes?: number): string {
    if (!bytes) return "—"
    const mb = bytes / 1024 / 1024
    if (mb < 1024) return `${Math.round(mb)} MB`
    return `${Math.round(mb / 1024 * 100) / 100} GB`
  }

  function formatDate(dateString?: string | number): string {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="border-purple-500/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Uploads</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6"><div className="h-4 w-32 bg-muted rounded animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 w-16 bg-muted rounded animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 w-12 bg-muted rounded animate-pulse"></div></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse"></div></TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                      <div className="h-8 w-16 bg-muted rounded animate-pulse"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : videos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No videos uploaded yet
                </TableCell>
              </TableRow>
            ) : (
              videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="pl-6 font-medium">{video.title}</TableCell>
                  <TableCell><StatusBadge s={video.status || "uploaded"} /></TableCell>
                  <TableCell>{formatSize(video.sizeBytes)}</TableCell>
                  <TableCell>{formatDate(video.createdAt)}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/dashboard/videos/${video.id}`}><Link2 className="mr-2 h-4 w-4" />Open</a>
                      </Button>
                      <Button size="sm" asChild disabled={(video.status || "uploaded") !== "ready"}>
                        <a href={`/videos/${video.id}`}><PlayCircle className="mr-2 h-4 w-4" />Watch</a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
