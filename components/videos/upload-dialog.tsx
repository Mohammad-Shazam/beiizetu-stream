"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { uploadVideo } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { listFolders } from "@/lib/api"

export function UploadDialog({ 
  open, 
  onOpenChange, 
  onUploaded 
}: { 
  open: boolean; 
  onOpenChange: (v: boolean) => void; 
  onUploaded?: () => void;
}) {
  const [file, setFile] = React.useState<File | null>(null)
  const [title, setTitle] = React.useState("")
  const [folderId, setFolderId] = React.useState<string>("root")
  const [visibility, setVisibility] = React.useState<"public" | "private" | "role">("private")
  const [folders, setFolders] = React.useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      listFolders().then((f) => setFolders(f.map(({ id, name }) => ({ id, name }))))
    }
  }, [open])

  async function handleUpload() {
    if (!file) return
    
    setLoading(true)
    setProgress(0)
    
    try {
      const result = await uploadVideo({
        file,
        title: title || file.name,
        folderId,
        visibility,
        onProgress: (p) => setProgress(p)
      })
      
      toast({ 
        title: "Upload successful", 
        description: `"${result.title}" has been uploaded.` 
      })
      
      // Reset form
      setFile(null)
      setTitle("")
      setVisibility("private")
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ""
      
      // Close dialog and refresh list
      onOpenChange(false)
      onUploaded?.()
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Select file</Label>
            <Input 
              id="file"
              ref={fileInputRef}
              type="file" 
              accept="video/*" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input 
              id="title"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder={file?.name || "Enter video title"} 
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="folder">Folder</Label>
            <Select value={folderId} onValueChange={setFolderId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Choose folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility</Label>
            <Select value={visibility} onValueChange={(value: "public" | "private" | "role") => setVisibility(value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Choose visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <span>🔒</span>
                    <span>Private</span>
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <span>🌍</span>
                    <span>Public</span>
                  </div>
                </SelectItem>
                <SelectItem value="role">
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>Role-gated</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {visibility === "private" && "Only you can view this video"}
              {visibility === "public" && "Anyone with the link can view this video"}
              {visibility === "role" && "Only users with specific roles can view this video"}
            </p>
          </div>
          
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || loading}>
            {loading ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}