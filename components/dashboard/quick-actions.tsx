// components/dashboard/quick-actions.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Upload, Settings, PlusCircle } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <Link href="/dashboard/upload"><Upload className="mr-2 h-4 w-4" />Upload Video</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/dashboard/videos"><PlusCircle className="mr-2 h-4 w-4" />New Entry</Link>
      </Button>
      <Button variant="ghost" asChild>
        <Link href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" />Settings</Link>
      </Button>
    </div>
  )
}
