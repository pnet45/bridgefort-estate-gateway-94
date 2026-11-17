import { supabase, supabaseKey, supabaseUrl } from '@/integrations/supabase/client';

type StorageUploadOptions = {
  contentType: string;
  cacheControl?: string;
  upsert?: boolean;
};

export async function uploadStorageFileWithProgress(
  bucket: string,
  objectPath: string,
  file: File,
  options: StorageUploadOptions,
  onProgress: (percent: number) => void,
): Promise<void> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const accessToken = session?.access_token;
  if (!accessToken) throw new Error('Your session has expired. Please sign in again.');

  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`);
    xhr.setRequestHeader('apikey', supabaseKey);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('Content-Type', options.contentType);
    xhr.setRequestHeader('Cache-Control', `max-age=${options.cacheControl || '3600'}`);
    xhr.setRequestHeader('x-upsert', options.upsert ? 'true' : 'false');

    xhr.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
    };
    xhr.onerror = () => reject(new Error('Network error while uploading. Check your connection and try again.'));
    xhr.onabort = () => reject(new Error('Upload was cancelled.'));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      let message = 'Upload failed. Please try again.';
      try {
        const body = JSON.parse(xhr.responseText);
        message = body.message || body.error || message;
      } catch {
        if (xhr.statusText) message = xhr.statusText;
      }
      reject(new Error(message));
    };
    xhr.send(file);
  });
}
