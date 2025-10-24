// app/dashboard/upload/page.tsx
"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { UploadDialog } from "@/components/videos/upload-dialog"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function UploadPage() {
  const [open, setOpen] = useState(true)

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
                <BreadcrumbPage>Upload</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Button onClick={() => setOpen(true)}>Upload Video</Button>
          </div>
        </header>

        <div className="p-6">
          <div className="mx-auto max-w-xl rounded-lg border p-6 text-sm text-muted-foreground">
            Use the dialog to select a video and (mock) upload it to the chosen folder. In the real
            system, this would POST to `/api/upload` and kick FFmpeg.
          </div>
        </div>

        <UploadDialog open={open} onOpenChange={setOpen} />
      </SidebarInset>
    </SidebarProvider>
  )
}
