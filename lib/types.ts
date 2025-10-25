export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  url?: string;
  fileName?: string;
  thumbnailUrl?: string;
  posterUrl?: string;
  duration?: number;
  durationSec?: number;
  size?: number;
  sizeBytes?: number;
  folderId: string;
  uploadedBy?: string;
  uploadedAt?: string;
  createdAt?: number | string;
  updatedAt?: string;
  status?: VideoStatus;
  visibility?: Visibility;
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
  createdBy?: string;
  createdAt: string | number;
  updatedAt?: string;
}

export type Visibility = "public" | "private" | "role";
export type VideoStatus = "processing" | "ready" | "uploaded" | "error";
