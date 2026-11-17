import { supabase, supabaseUrl, supabaseKey } from '@/integrations/supabase/client';

type UploadProgress = (percent: number) => void;

/**
 * Upload through the Storage REST endpoint so the browser can report genuine
 * byte-level progress. The user's current Supabase session is used; no service
 * role key or privileged credential is exposed.
 */
export async function uploadFileWithProgress(
  bucket: string,
  objectPath: string,
  file: File,
  contentType: string,
  onProgress: UploadProgress,
  cacheControl = '3600',
): Promise<void> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (!session?.access_token) throw new Error('Your session has expired. Please sign in again.');

  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/');
  const endpoint = `${supabaseUrl.replace(/\\/$/, '')}/storage/v1/object/${encodeURIComponent(bucket)}/${encodedPath}`;

  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', endpoint, true);
    request.setRequestHeader('apikey', supabaseKey);
    request.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    request.setRequestHeader('Content-Type', contentType);
    request.setRequestHeader('Cache-Control', `max-age=${cacheControl}`);
    request.setRequestHeader('x-upsert', 'false');

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.min(99, Math.round((event.loaded / event.total) * 100)));
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        onProgress(100);
        resolve();
        return;
      }
      let message = `Upload failed (HTTP ${request.status}).`;
      try {
        const payload = JSON.parse(request.responseText);
        message = payload.message || payload.error || message;
      } catch { /* keep the HTTP fallback */ }
      reject(new Error(message));
    };
    request.onerror = () => reject(new Error('Network error while uploading. Check your connection and try again.'));
    request.onabort = () => reject(new Error('Upload was cancelled.'));
    request.send(file);
  });
}
