"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, Link2, Calendar, FileVideo, Eye, EyeOff, Users, Globe } from "lucide-react"
import { Video } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export function VideoCard({ v }: { v: Video }) {
  const { user } = useAuth()
  const size = v.sizeBytes ? `${Math.round(v.sizeBytes / 1_000_000)} MB` : "—"
  const statusVariant = {
    ready: "default",
    uploaded: "secondary",
    processing: "outline",
    error: "destructive",
  } as const

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case "public": return <Globe className="h-3 w-3" />
      case "private": return <EyeOff className="h-3 w-3" />
      case "role": return <Users className="h-3 w-3" />
      default: return <Eye className="h-3 w-3" />
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {v.thumbnailUrl ? (
          <img
            src={v.thumbnailUrl}
            alt={v.title}
            className="w-full h-full object-cover"
          />
        ) : v.url ? (
          <video
            src={v.url}
            className="w-full h-full object-cover"
            muted
            onMouseEnter={(e) => e.currentTarget.play()}
            onMouseLeave={(e) => e.currentTarget.pause()}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <FileVideo className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <PlayCircle className="h-12 w-12 text-white drop-shadow-lg" />
        </div>
      </div>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-medium">{v.title}</h3>
          <Badge variant={statusVariant[v.status || "uploaded"]} className="shrink-0 capitalize">
            {v.status || "uploaded"}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            {getVisibilityIcon(v.visibility || "private")}
            {v.visibility || "private"}
          </Badge>
          <span className="text-xs text-muted-foreground">{size}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {new Date(v.createdAt || Date.now()).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Uploaded by: {v.uploadedBy || (user?.displayName || "Unknown")}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button asChild size="sm" variant="outline" className="flex-1">
          <a href={`/dashboard/videos/${v.id}`}>
            <Link2 className="mr-2 h-4 w-4" />
            Details
          </a>
        </Button>
        <Button asChild size="sm" className="flex-1" disabled={(v.status || "uploaded") !== "ready"}>
          <a href={`/videos/${v.id}`}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Watch
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}