//app/dashboard/videos/%5Bid%5D/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getVideo, updateVideo, deleteVideo } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Save, Eye, EyeOff, Users, Globe, Trash2, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Video } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"

export default function VideoDetailsPage() {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<"public" | "private" | "role">("private")

  useEffect(() => {
    if (id) {
      loadVideo()
    }
  }, [id])

  async function loadVideo() {
    try {
      const v = await getVideo(id as string)
      if (v) {
        setVideo(v)
        setTitle(v.title)
        setDescription(v.description || "")
        setVisibility(v.visibility || "private")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load video",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!video) return
    
    setSaving(true)
    try {
      const updatedVideo = await updateVideo(video.id, { 
        title, 
        visibility,
        description: description || undefined
      })
      setVideo(updatedVideo)
      toast({
        title: "Success",
        description: "Video updated successfully"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!video) return
    
    setDeleting(true)
    try {
      await deleteVideo(video.id)
      toast({
        title: "Success",
        description: "Video deleted successfully"
      })
      router.push('/dashboard/videos')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
    }
  }

  const getVisibilityIcon = (v: string) => {
    switch (v) {
      case "public": return <Globe className="h-4 w-4" />
      case "private": return <EyeOff className="h-4 w-4" />
      case "role": return <Users className="h-4 w-4" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (!video) {
    return <div className="p-6">Video not found</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Videos
        </Button>
        <h1 className="text-3xl font-bold">Video Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter video description (optional)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={visibility} onValueChange={(value: "public" | "private" | "role") => setVisibility(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        <span>Private</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span>Public</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="role">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
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

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you sure?</DialogTitle>
                      <DialogDescription>
                        This will permanently delete the video "{video.title}". This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {}}>Cancel</Button>
                      <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Deleting..." : "Delete"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Status</span>
                <Badge variant={(video.status || "uploaded") === "ready" ? "default" : "outline"}>
                  {video.status || "uploaded"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Visibility</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {getVisibilityIcon(video.visibility || "private")}
                  {video.visibility || "private"}
                </Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File size</span>
                  <span>{video.sizeBytes ? Math.round(video.sizeBytes / 1024 / 1024) : 0} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{video.url?.split('.').pop()?.toUpperCase() || "Unknown"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded</span>
                  <span>{new Date(video.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uploaded by</span>
                  <span>{video.uploadedBy || (user?.displayName || "Unknown")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <a href={`/videos/${video.id}`}>
                  Watch Video
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href={video.url || "#"} target="_blank" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download File
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}