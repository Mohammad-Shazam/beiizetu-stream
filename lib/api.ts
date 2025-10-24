import { Video, Folder } from "./types"

// Real API functions
export async function listVideos(params: {
  folderId?: string
  q?: string
  status?: string
  visibility?: string
}): Promise<Video[]> {
  const searchParams = new URLSearchParams();
  if (params.folderId) searchParams.append('folderId', params.folderId);
  if (params.q) searchParams.append('q', params.q);
  if (params.status) searchParams.append('status', params.status);
  if (params.visibility) searchParams.append('visibility', params.visibility);

  const response = await fetch(`/api/videos?${searchParams}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  
  const data = await response.json();
  return data.videos;
}

export async function listFolders(): Promise<Folder[]> {
  const response = await fetch('/api/folders', {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch folders');
  }
  
  const data = await response.json();
  return data.folders;
}

export async function getVideo(id: string): Promise<Video | null> {
  const response = await fetch(`/api/videos/${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch video');
  }
  
  const data = await response.json();
  return data.video;
}

export async function updateVideo(id: string, updates: {
  title?: string
  visibility?: 'public' | 'private' | 'role'
  description?: string
  status?: string
}): Promise<Video> {
  const response = await fetch(`/api/videos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to update video');
  }
  
  const data = await response.json();
  return data.video;
}

export async function deleteVideo(id: string): Promise<void> {
  const response = await fetch(`/api/videos/${id}`, {
    method: 'DELETE',
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete video');
  }
}

export async function generateSignedUrl(id: string): Promise<string> {
  const response = await fetch(`/api/videos/${id}/sign`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate URL');
  }
  
  const data = await response.json();
  return data.url;
}

export async function uploadVideo(params: {
  file: File
  title?: string
  folderId?: string
  visibility?: 'public' | 'private' | 'role'
  onProgress?: (progress: number) => void
}): Promise<{ videoId: string; title: string; visibility?: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', params.file);
    if (params.title) formData.append('title', params.title);
    if (params.folderId) formData.append('folderId', params.folderId);
    if (params.visibility) formData.append('visibility', params.visibility);
    
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    if (params.onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          params.onProgress!(progress);
        }
      });
    }
    
    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const response = JSON.parse(xhr.responseText);
          reject(new Error(response.error || 'Upload failed'));
        } catch (error) {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    });
    
    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });
    
    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });
    
    // Open and send request
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

export async function createFolder(name: string, parentId: string): Promise<Folder> {
  const response = await fetch('/api/folders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, parentId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create folder');
  }
  
  const data = await response.json();
  return data.folder;
}

export async function updateFolder(id: string, updates: {
  name?: string
  parentId?: string
}): Promise<Folder> {
  const response = await fetch(`/api/folders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update folder');
  }
  
  const data = await response.json();
  return data.folder;
}

export async function deleteFolder(id: string): Promise<void> {
  const response = await fetch(`/api/folders/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete folder');
  }
}