// components/dashboard/stats-cards.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Film, Upload, CheckCircle2, Clock3, AlertTriangle, HardDrive } from "lucide-react"

type Stat = {
  title: string
  value: string
  sub?: string
  icon: React.ElementType
  variant?: "default" | "secondary" | "destructive" | "outline"
}

const STATS: Stat[] = [
  { title: "Total Videos", value: "128", sub: "+12 this week", icon: Film },
  { title: "Uploaded", value: "56", sub: "Awaiting transcode", icon: Upload, variant: "secondary" },
  { title: "Processing", value: "7", sub: "avg 2–5 min", icon: Clock3 },
  { title: "Ready", value: "62", sub: "CDN cached", icon: CheckCircle2 },
  { title: "Errors", value: "3", sub: "needs retry", icon: AlertTriangle, variant: "destructive" },
  { title: "Storage Used", value: "412 GB", sub: "of 2 TB", icon: HardDrive },
]

export function StatsCards() {
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
