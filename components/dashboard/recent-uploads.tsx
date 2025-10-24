// components/dashboard/recent-uploads.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlayCircle, Link2, RefreshCw } from "lucide-react"

type Row = {
  id: string
  title: string
  status: "uploaded" | "processing" | "ready" | "error"
  size: string
  createdAt: string
}

const ROWS: Row[] = [
  { id: "vid_9a1", title: "Site Tour 1080p", status: "processing", size: "1.2 GB", createdAt: "Oct 24, 2025" },
  { id: "vid_7f3", title: "Onboarding Clip", status: "ready", size: "380 MB", createdAt: "Oct 24, 2025" },
  { id: "vid_5c8", title: "Promo – Q4", status: "uploaded", size: "2.4 GB", createdAt: "Oct 23, 2025" },
  { id: "vid_2b2", title: "Tutorial Part 1", status: "ready", size: "940 MB", createdAt: "Oct 22, 2025" },
  { id: "vid_1aa", title: "Raw Interview", status: "error", size: "3.1 GB", createdAt: "Oct 21, 2025" },
]

function StatusBadge({ s }: { s: Row["status"] }) {
  const map = {
    uploaded: { label: "Uploaded", variant: "secondary" as const },
    processing: { label: "Processing", variant: "outline" as const },
    ready: { label: "Ready", variant: "default" as const },
    error: { label: "Error", variant: "destructive" as const },
  }
  const { label, variant } = map[s]
  return <Badge variant={variant}>{label}</Badge>
}

export function RecentUploads() {
  return (
    <Card className="border-purple-500/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Uploads</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
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
            {ROWS.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="pl-6 font-medium">{r.title}</TableCell>
                <TableCell><StatusBadge s={r.status} /></TableCell>
                <TableCell>{r.size}</TableCell>
                <TableCell>{r.createdAt}</TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/dashboard/videos/${r.id}`}><Link2 className="mr-2 h-4 w-4" />Open</a>
                    </Button>
                    <Button size="sm" asChild disabled={r.status !== "ready"}>
                      <a href={`/videos/${r.id}`}><PlayCircle className="mr-2 h-4 w-4" />Watch</a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
