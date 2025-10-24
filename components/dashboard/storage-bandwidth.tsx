// components/dashboard/storage-bandwidth.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { listVideos } from "@/lib/api"
import { Video } from "@/lib/types"

export function StorageBandwidth() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStorageData() {
      try {
        const videoList = await listVideos({})
        setVideos(videoList)
      } catch (error) {
        console.error('Failed to load videos for storage:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStorageData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="border-purple-500/10 animate-pulse">
            <CardHeader>
              <div className="h-6 w-32 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <div className="h-4 w-16 bg-muted rounded mb-2"></div>
                <div className="h-4 w-24 bg-muted rounded"></div>
              </div>
              <div className="h-2 w-full bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Calculate real storage usage
  const totalSizeBytes = videos.reduce((acc, v) => acc + (v.sizeBytes || 0), 0)
  const totalSizeGB = Math.round(totalSizeBytes / 1024 / 1024 / 1024 * 100) / 100
  const totalSizeTB = Math.round(totalSizeGB / 1024 * 100) / 100
  
  // Mock storage capacity (2TB = 2048GB)
  const storageCap = 2048
  const storagePct = Math.min(Math.round((totalSizeGB / storageCap) * 100), 100)

  // Mock bandwidth data (would need real analytics)
  const bandwidthThisMonth = 1.8
  const bandwidthBudget = 5
  const bandwidthPct = Math.min(Math.round((bandwidthThisMonth / bandwidthBudget) * 100), 100)

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-purple-500/10">
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-end justify-between">
            <div className="text-sm text-muted-foreground">Used</div>
            <div className="text-sm font-medium">{totalSizeGB} GB / {storageCap} GB</div>
          </div>
          <Progress value={storagePct} />
          <p className="mt-2 text-xs text-muted-foreground">{storagePct}% of capacity</p>
        </CardContent>
      </Card>

      <Card className="border-purple-500/10">
        <CardHeader>
          <CardTitle>Bandwidth (This Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex items-end justify-between">
            <div className="text-sm text-muted-foreground">Egress</div>
            <div className="text-sm font-medium">{bandwidthThisMonth} TB / {bandwidthBudget} TB</div>
          </div>
          <Progress value={bandwidthPct} />
          <p className="mt-2 text-xs text-muted-foreground">{bandwidthPct}% of budget</p>
        </CardContent>
      </Card>
    </div>
  )
}


