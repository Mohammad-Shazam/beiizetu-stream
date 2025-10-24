// app/videos/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { notFound, useParams } from "next/navigation"
import { getVideo, generateSignedUrl } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { PlayCircle, Link2, Copy } from "lucide-react"

export default function WatchPage() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [status, setStatus] = useState<"uploaded"|"processing"|"ready"|"error">("uploaded")
  const [visibility, setVisibility] = useState<"public"|"private"|"role">("private")
  const [desc, setDesc] = useState<string>("")

  useEffect(() => {
    async function load() {
      const v = await getVideo(id)
      if (!v) return notFound()
      setTitle(v.title)
      setStatus(v.status)
      setVisibility(v.visibility)
      setDesc(v.description ?? "")
      setLoading(false)
    }
    load()
  }, [id])

  async function handleGetUrl() {
    const u = await generateSignedUrl(id)
    setUrl(u)
  }

  function copy() {
    if (!url) return
    navigator.clipboard.writeText(url)
  }

  if (loading) {
    return <div className="p-6">Loading…</div>
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant={status === "ready" ? "default" : status === "error" ? "destructive" : "outline"}>
            {status}
          </Badge>
          <Badge variant="secondary">{visibility}</Badge>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="aspect-video w-full bg-muted" />
        </CardContent>
      </Card>

      <div className="mt-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleGetUrl} disabled={status !== "ready"}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Get Play URL
          </Button>
          <Button variant="outline" onClick={copy} disabled={!url}>
            <Copy className="mr-2 h-4 w-4" />
            Copy URL
          </Button>
          {url ? (
            <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-primary underline">
              <Link2 className="mr-2 h-4 w-4" /> Open manifest
            </a>
          ) : null}
        </div>

        {url ? (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Signed HLS URL</div>
              <code className="block overflow-x-auto rounded-md bg-muted p-3 text-xs">{url}</code>
              <div className="text-xs text-muted-foreground">
                (Mock) In production this would be a short-lived <code>.m3u8</code> with <code>?exp</code> and <code>?sig</code>.
              </div>
            </div>
          </>
        ) : null}

        {desc ? (
          <>
            <Separator />
            <p className="text-sm text-muted-foreground">{desc}</p>
          </>
        ) : null}
      </div>
    </div>
  )
}
