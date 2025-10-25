//app/dashboard/videos/page.tsx
"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { FolderTree } from "@/components/videos/folder-tree"
import { VideosToolbar } from "@/components/videos/videos-toolbar"
import { VideoCard } from "@/components/videos/video-card"
import { UploadDialog } from "@/components/videos/upload-dialog"
import { listVideos } from "@/lib/api"
import { Video } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function VideosPage() {
  const [folderId, setFolderId] = useState<string>("all")
  const [filters, setFilters] = useState<{ q: string; status: string; visibility: string }>({ q: "", status: "all", visibility: "all" })
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Loading videos with filters:', { folderId, filters })
      const vs = await listVideos({
        folderId,
        q: filters.q,
        status: filters.status as any,
        visibility: filters.visibility as any,
      })
      
      console.log('Loaded videos:', vs)
      setVideos(vs)
    } catch (error) {
      console.error("Failed to load videos:", error)
      setError(error instanceof Error ? error.message : "Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    load() 
  }, [folderId, filters]) // eslint-disable-line

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Beiizetu Storage</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Videos</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
            <aside className="rounded-lg border p-3">
              <h3 className="mb-2 text-sm font-semibold">Folders</h3>
              <FolderTree activeId={folderId} onSelect={setFolderId} />
            </aside>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <VideosToolbar onChange={setFilters} />
                <Button onClick={() => setUploadOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-video animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : videos.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((v) => <VideoCard key={v.id} v={v} />)}
                </div>
              ) : (
                <div className="rounded-lg border p-10 text-center text-sm text-muted-foreground">
                  No videos found in this folder.
                  <div className="mt-4">
                    <Button onClick={() => setUploadOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Upload your first video
                    </Button>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </SidebarInset>
      
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUploaded={load} />
    </SidebarProvider>
  )
}