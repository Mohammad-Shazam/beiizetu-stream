// app/components/app-sidebar.tsx
import * as React from "react"
import { Film, Home, Upload, Users, Settings, Library, UserCircle, PlayCircle } from "lucide-react"

import { SearchForm } from "@/components/search-form"
import { VersionSwitcher } from "@/components/version-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  // Show product name in the version switcher (acts like a brand selector)
  versions: ["Beiizetu Storage"],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      items: [
        { title: "Overview", url: "/dashboard", icon: Home, isActive: false },
        { title: "Upload Video", url: "/dashboard/upload", icon: Upload },
        { title: "All Videos", url: "/dashboard/videos", icon: Film },
      ],
    },
    {
      title: "Management",
      url: "/dashboard",
      items: [
        { title: "Users & Roles", url: "/dashboard/users", icon: Users },
        { title: "Settings", url: "/dashboard/settings", icon: Settings },
      ],
    },
    {
      title: "Viewer",
      url: "/videos",
      items: [
        { title: "Public Videos", url: "/videos", icon: PlayCircle },
        { title: "My Library", url: "/library", icon: Library },
        { title: "My Profile", url: "/profile", icon: UserCircle },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm />
      </SidebarHeader>

      <SidebarContent>
        {data.navMain.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url} className="flex items-center gap-2">
                        {item.icon ? <item.icon className="h-4 w-4" /> : null}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
