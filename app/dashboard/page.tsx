// app/dashboard/page.tsx (or wherever your Page lives)
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { StatsCards } from "@/components/dashboard/stats-cards"
import { RecentUploads } from "@/components/dashboard/recent-uploads"
import { StorageBandwidth } from "@/components/dashboard/storage-bandwidth"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Beiizetu Storage</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <QuickActions />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Top stats */}
          <StatsCards />

          {/* Storage & Bandwidth */}
          <StorageBandwidth />

          {/* Recent uploads table */}
          <RecentUploads />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
