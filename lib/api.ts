// lib/mock/api.ts
import { Folder, Video, Visibility, VideoStatus } from "./types"

let FOLDERS: Folder[] = [
  { id: "root", name: "All Videos", parentId: null, createdAt: Date.now() - 9e6 },
  { id: "marketing", name: "Marketing", parentId: "root", createdAt: Date.now() - 8e6 },
  { id: "tutorials", name: "Tutorials", parentId: "root", createdAt: Date.now() - 7e6 },
]

let VIDEOS: Video[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `vid_${i + 1}`,
  title: `Sample Video ${i + 1}`,
  description: "Mock description here",
  status: i % 5 === 0 ? "processing" : "ready",
  visibility: i % 3 === 0 ? "public" : "private",
  folderId: i % 2 === 0 ? "marketing" : "tutorials",
  sizeBytes: 300_000_000 + i * 10_000_000,
  durationSec: 120 + i * 13,
  createdAt: Date.now() - i * 36e5,
  posterUrl: `https://picsum.photos/seed/mock${i}/640/360`,
}))

const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export async function listFolders() {
  await wait()
  return FOLDERS
}

export async function createFolder(name: string, parentId: string | null = "root") {
  await wait()
  const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`
  const folder: Folder = { id, name, parentId, createdAt: Date.now() }
  FOLDERS.push(folder)
  return folder
}

export async function listVideos(params?: {
  folderId?: string | null
  q?: string
  status?: VideoStatus | "all"
  visibility?: Visibility | "all"
}) {
  await wait()
  let out = [...VIDEOS]
  if (params?.folderId && params.folderId !== "root") {
    out = out.filter((v) => v.folderId === params.folderId)
  }
  if (params?.q) {
    const q = params.q.toLowerCase()
    out = out.filter((v) => v.title.toLowerCase().includes(q))
  }
  if (params?.status && params.status !== "all") {
    out = out.filter((v) => v.status === params.status)
  }
  if (params?.visibility && params.visibility !== "all") {
    out = out.filter((v) => v.visibility === params.visibility)
  }
  return out
}

export async function uploadVideoMock(fileName: string, folderId: string | null = "root") {
  await wait(600)
  const id = `vid_${Math.random().toString(36).slice(2, 8)}`
  const v: Video = {
    id,
    title: fileName.replace(/\.[^.]+$/, ""),
    description: "Uploaded (mock)",
    status: "uploaded",
    visibility: "private",
    folderId,
    sizeBytes: 500_000_000,
    durationSec: 180,
    createdAt: Date.now(),
    posterUrl: `https://picsum.photos/seed/${id}/640/360`,
  }
  VIDEOS.unshift(v)
  return v
}

export async function getVideo(id: string): Promise<Video | null> {
  await wait()
  const v = VIDEOS.find(v => v.id === id)
  return v ?? null
}

export async function generateSignedUrl(id: string) {
  await wait(300)
  // fake signed HLS URL
  return `https://cdn.example.com/hls/${id}/master.m3u8?exp=1699999999&sig=abcdef0123456789`
}
