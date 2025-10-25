//app/components/videos/folder-tree.tsx
"use client"

import { useEffect, useState } from "react"
import { listFolders } from "@/lib/api"
import { Folder } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { FolderPlus, Folder as FolderIcon, FolderOpen } from "lucide-react"
import { NewFolderDialog } from "./new-folder-dialog"

export function FolderTree({
  activeId,
  onSelect,
}: { activeId?: string; onSelect: (id: string) => void }) {
  const [folders, setFolders] = useState<Folder[]>([])
  const [openNew, setOpenNew] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listFolders()
      .then(setFolders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Get root folders (parentId is null or "root")
  const roots = folders.filter((f) => f.parentId === null || f.id === "root")
  
  // Get children of a folder
  const children = (parentId: string) => folders.filter((f) => f.parentId === parentId)

  return (
    <div className="space-y-1">
      {/* Add "All Videos" option */}
      <button
        onClick={() => onSelect("all")}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted transition-colors ${
          activeId === "all" ? "bg-muted" : ""
        }`}
      >
        <FolderIcon className="h-4 w-4 text-muted-foreground" />
        <span className="truncate text-sm">All Videos</span>
        {activeId === "all" && (
          <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
        )}
      </button>
      
      {loading ? (
        <div className="px-2 py-1.5 text-sm text-muted-foreground">Loading folders...</div>
      ) : (
        roots.map((r) => (
          <div key={r.id}>
            <FolderRow 
              f={r} 
              activeId={activeId} 
              onSelect={onSelect}
              level={0}
              hasChildren={children(r.id).length > 0}
            />
            <div className="ml-4 space-y-1">
              {children(r.id).map((c) => (
                <FolderRow 
                  key={c.id} 
                  f={c} 
                  activeId={activeId} 
                  onSelect={onSelect}
                  level={1}
                  hasChildren={children(c.id).length > 0}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <Button variant="outline" className="mt-2 w-full" onClick={() => setOpenNew(true)}>
        <FolderPlus className="mr-2 h-4 w-4" /> New Folder
      </Button>

      <NewFolderDialog 
        open={openNew} 
        onOpenChange={setOpenNew} 
        onCreated={() => listFolders().then(setFolders).catch(console.error)} 
      />
    </div>
  )
}

function FolderRow({ 
  f, 
  activeId, 
  onSelect, 
  level, 
  hasChildren 
}: { 
  f: Folder; 
  activeId?: string; 
  onSelect: (id: string) => void;
  level: number;
  hasChildren: boolean;
}) {
  const active = activeId === f.id
  
  return (
    <button
      onClick={() => onSelect(f.id)}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-muted transition-colors ${
        active ? "bg-muted" : ""
      }`}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
    >
      {hasChildren ? (
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
      ) : (
        <FolderIcon className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="truncate text-sm">{f.name}</span>
      {active && (
        <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
      )}
    </button>
  )
}