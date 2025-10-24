export interface UploadOptions {
  file: File;
  title?: string;
  folderId?: string;
  onProgress?: (progress: number) => void;
  token: string;
}

export async function uploadVideo(options: UploadOptions): Promise<{ videoId: string }> {
  const { file, title, folderId, onProgress, token } = options;
  
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (folderId) formData.append('folderId', folderId);
    
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
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
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
}