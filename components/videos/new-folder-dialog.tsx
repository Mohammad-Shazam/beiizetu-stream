"use client"

import * as React from "react"
import { createFolder } from "@/lib/api"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export function NewFolderDialog({
  open,
  onOpenChange,
  onCreated,
}: { open: boolean; onOpenChange: (v: boolean) => void; onCreated?: () => void }) {
  const [name, setName] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    
    try {
      await createFolder(name, "root")
      setName("")
      onCreated?.()
      onOpenChange(false)
      toast({ title: "Folder created", description: `"${name}" has been added.` })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create folder",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="fname">Folder name</Label>
          <Input 
            id="fname" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Client Videos" 
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}