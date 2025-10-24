// components/videos/video-card.tsx
"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlayCircle, Link2 } from "lucide-react"
import { Video } from "@/lib/types"

export function VideoCard({ v }: { v: Video }) {
  const size = v.sizeBytes ? `${Math.round(v.sizeBytes / 1_000_000)} MB` : "—"
  const statusVariant = {
    ready: "default",
    uploaded: "secondary",
    processing: "outline",
    error: "destructive",
  } as const

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-muted">
        {v.posterUrl ? (
          <Image src={v.posterUrl} alt={v.title} fill className="object-cover" />
        ) : null}
      </div>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="truncate font-medium">{v.title}</h3>
          <Badge variant={statusVariant[v.status]} className="shrink-0 capitalize">{v.status}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{v.visibility}</span>
          <span>{size}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 p-4 pt-0">
        <Button asChild size="sm" variant="outline">
          <a href={`/dashboard/videos/${v.id}`}><Link2 className="mr-2 h-4 w-4" />Open</a>
        </Button>
        <Button asChild size="sm" disabled={v.status !== "ready"}>
          <a href={`/videos/${v.id}`}><PlayCircle className="mr-2 h-4 w-4" />Watch</a>
        </Button>
      </CardFooter>
    </Card>
  )
}
