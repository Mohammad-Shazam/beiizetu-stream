// components/dashboard/stats-cards.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Film, Upload, CheckCircle2, Clock3, AlertTriangle, HardDrive } from "lucide-react"
import { listVideos } from "@/lib/api"
import { Video } from "@/lib/types"

type Stat = {
  title: string
  value: string
  sub?: string
  icon: React.ElementType
  variant?: "default" | "secondary" | "destructive" | "outline"
}

export function StatsCards() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const videoList = await listVideos({})
        setVideos(videoList)
      } catch (error) {
        console.error('Failed to load videos for stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-purple-500/10 animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded"></div>
              <div className="h-5 w-5 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2"></div>
              <div className="h-5 w-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const totalVideos = videos.length
  const uploadedVideos = videos.filter(v => v.status === 'uploaded').length
  const processingVideos = videos.filter(v => v.status === 'processing').length
  const readyVideos = videos.filter(v => v.status === 'ready').length
  const errorVideos = videos.filter(v => v.status === 'error').length
  
  const totalSizeBytes = videos.reduce((acc, v) => acc + (v.sizeBytes || 0), 0)
  const totalSizeGB = Math.round(totalSizeBytes / 1024 / 1024 / 1024 * 100) / 100
  const totalSizeTB = Math.round(totalSizeGB / 1024 * 100) / 100

  const STATS: Stat[] = [
    { title: "Total Videos", value: totalVideos.toString(), sub: "All time", icon: Film },
    { title: "Uploaded", value: uploadedVideos.toString(), sub: "Awaiting transcode", icon: Upload, variant: "secondary" },
    { title: "Processing", value: processingVideos.toString(), sub: "In queue", icon: Clock3 },
    { title: "Ready", value: readyVideos.toString(), sub: "Available", icon: CheckCircle2 },
    { title: "Errors", value: errorVideos.toString(), sub: "Need attention", icon: AlertTriangle, variant: "destructive" },
    { title: "Storage Used", value: `${totalSizeGB} GB`, sub: `~${totalSizeTB} TB`, icon: HardDrive },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {STATS.map((s) => (
        <Card key={s.title} className="border-purple-500/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{s.title}</CardTitle>
            <s.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{s.value}</div>
            {s.sub ? (
              <Badge variant={s.variant ?? "outline"} className="mt-2">
                {s.sub}
              </Badge>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
