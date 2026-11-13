import React, { useEffect, useId, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2, Upload } from "lucide-react";

interface KYCUploadFieldProps {
  label: string;
  bucket: string;
  userId: string;
  docKey: string;
  onUploaded: (fileUrl: string, fileName: string, mimetype: string) => void;
  existingUrl?: string;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024;
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  pdf: "application/pdf",
};
const ALLOWED_MIME_TYPES = new Set(Object.values(MIME_BY_EXTENSION));

const KYCUploadField: React.FC<KYCUploadFieldProps> = ({
  label, bucket, userId, docKey, onUploaded, existingUrl
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(existingUrl || "");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    setUploadedUrl(existingUrl || "");
  }, [existingUrl]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Capture the input and File synchronously. Do not preventDefault() on a
    // change event: mobile browsers need to complete the native file selection.
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || uploading) return;

    setSelectedFileName(file.name);
    setUploadError("");

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const inferredMime = MIME_BY_EXTENSION[extension];
    const mimeType = file.type || inferredMime || "";

    // Android document providers sometimes report application/octet-stream or
    // an empty MIME type. Accept a supported extension in that case, while
    // continuing to reject an explicitly unsupported MIME/extension pair.
    const genericMime = !mimeType || mimeType === "application/octet-stream";
    const supported = Boolean(inferredMime) &&
      (genericMime || (ALLOWED_MIME_TYPES.has(mimeType) && mimeType === inferredMime));

    if (file.size > MAX_FILE_SIZE) {
      const message = "File must be 4MB or smaller.";
      setUploadError(message);
      toast({ title: "File too large", description: message, variant: "destructive" });
      input.value = "";
      return;
    }

    if (!supported) {
      const message = "Choose a JPG, PNG, WebP or PDF file.";
      setUploadError(message);
      toast({ title: "Unsupported file", description: message, variant: "destructive" });
      input.value = "";
      return;
    }

    if (!userId) {
      const message = "Your account could not be verified. Please sign in again.";
      setUploadError(message);
      toast({ title: "Upload unavailable", description: message, variant: "destructive" });
      input.value = "";
      return;
    }

    setUploading(true);
    try {
      const safeExtension = extension.replace(/[^a-z0-9]/g, "");
      const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const fileName = `${docKey}_${uniqueId}.${safeExtension}`;
      const filePath = `${userId}/${fileName}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false, contentType: inferredMime });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setUploadedUrl(data.publicUrl);
      onUploaded(data.publicUrl, fileName, inferredMime);
      setUploadError("");
      toast({ title: "Upload successful", description: `${label} uploaded.` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again.";
      setUploadError(message);
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setUploading(false);
      // Reset only the native picker value. Do not reset the parent profile form.
      input.value = "";
    }
  };

  return (
    <div className="my-2 min-w-0">
      <Label htmlFor={inputId} className="mb-1 block">{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          id={inputId}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={uploading}
          className="sr-only"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-describedby={`${inputId}-status`}
        >
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          {uploading ? "Uploading…" : "Choose file"}
        </Button>
        <span id={`${inputId}-status`} role="status" aria-live="polite" className="min-w-0 break-all text-xs text-muted-foreground">
          {uploading
            ? `Uploading ${selectedFileName}… Please keep this page open.`
            : uploadedUrl
              ? "File uploaded successfully"
              : selectedFileName || "PDF or image · Maximum 4MB"}
        </span>
        {uploadedUrl && !uploading && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Upload complete" />}
      </div>
      {uploadError && <p role="alert" className="mt-2 text-sm text-destructive">{uploadError}</p>}
      {uploadedUrl && (
        <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block break-all text-sm text-blue-600 underline">
          View uploaded file
        </a>
      )}
    </div>
  );
};

export default KYCUploadField;
