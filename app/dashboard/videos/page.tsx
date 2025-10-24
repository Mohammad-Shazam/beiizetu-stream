// app/dashboard/videos/page.tsx
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
import { listVideos } from "@/lib/api"
import { Video } from "@/lib/types"

export default function VideosPage() {
  const [folderId, setFolderId] = useState<string>("root")
  const [filters, setFilters] = useState<{ q: string; status: string; visibility: string }>({ q: "", status: "all", visibility: "all" })
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const vs = await listVideos({
      folderId,
      q: filters.q,
      status: filters.status as any,
      visibility: filters.visibility as any,
    })
    setVideos(vs)
    setLoading(false)
  }

  useEffect(() => { load() }, [folderId, filters]) // eslint-disable-line

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
              <VideosToolbar onChange={setFilters} />
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
                </div>
              )}
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
