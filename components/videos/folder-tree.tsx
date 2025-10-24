// components/videos/folder-tree.tsx
"use client"

import { useEffect, useState } from "react"
import { listFolders } from "@/lib/api"
import { Folder } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { FolderPlus, Folder as FolderIcon } from "lucide-react"
import { NewFolderDialog } from "./new-folder-dialog"

export function FolderTree({
  activeId,
  onSelect,
}: { activeId?: string; onSelect: (id: string) => void }) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [openNew, setOpenNew] = useState(false)

  useEffect(() => {
    listFolders().then(setFolders)
  }, [])

  const roots = folders.filter((f) => f.parentId === null || f.id === "root")
  const children = (pid: string) => folders.filter((f) => f.parentId === pid)

  return (
    <div className="space-y-2">
      {roots.map((r) => (
        <div key={r.id}>
          <FolderRow f={r} activeId={activeId} onSelect={onSelect} />
          <div className="ml-4 space-y-1">
            {children(r.id).map((c) => (
              <FolderRow key={c.id} f={c} activeId={activeId} onSelect={onSelect} />
            ))}
          </div>
        </div>
      ))}

      <Button variant="outline" className="mt-2 w-full" onClick={() => setOpenNew(true)}>
        <FolderPlus className="mr-2 h-4 w-4" /> New Folder
      </Button>

      <NewFolderDialog open={openNew} onOpenChange={setOpenNew} onCreated={() => listFolders().then(setFolders)} />
    </div>
  )
}

function FolderRow({ f, activeId, onSelect }: { f: Folder; activeId?: string; onSelect: (id: string) => void }) {
  const active = activeId === f.id
  return (
    <button
      onClick={() => onSelect(f.id)}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left hover:bg-muted ${active ? "bg-muted" : ""}`}
    >
      <FolderIcon className="h-4 w-4" />
      <span className="truncate">{f.name}</span>
    </button>
  )
}
