"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NewFolderDialog } from "./new-folder-dialog"
import { Plus } from "lucide-react"

export function VideosToolbar({
  onChange,
}: {
  onChange: (filters: { q: string; status: string; visibility: string }) => void
}) {
  const [q, setQ] = useState("")
  const [status, setStatus] = useState("all")
  const [visibility, setVisibility] = useState("all")
  const [openFolder, setOpenFolder] = useState(false)

  useEffect(() => {
    onChange({ q, status, visibility })
  }, [q, status, visibility]) // eslint-disable-line

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <Input placeholder="Search videos…" value={q} onChange={(e) => setQ(e.target.value)} />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="uploaded">Uploaded</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
        <Select value={visibility} onValueChange={setVisibility}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Visibility" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="private">Private</SelectItem>
            <SelectItem value="role">Role-gated</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setOpenFolder(true)}>
          <Plus className="mr-2 h-4 w-4" />Folder
        </Button>
      </div>

      <NewFolderDialog 
        open={openFolder} 
        onOpenChange={setOpenFolder} 
        onCreated={() => window.location.reload()} 
      />
    </div>
  )
}