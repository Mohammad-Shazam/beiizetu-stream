// components/dashboard/storage-bandwidth.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function StorageBandwidth() {
  // mock values
  const storageUsed = 412 // GB
  const storageCap = 2048 // GB
  const storagePct = Math.min(Math.round((storageUsed / storageCap) * 100), 100)

  const bandwidthThisMonth = 1.8 // TB
  const bandwidthBudget = 5 // TB
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
            <div className="text-sm font-medium">{storageUsed} GB / {storageCap} GB</div>
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
