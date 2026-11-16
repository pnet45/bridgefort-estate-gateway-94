import React, { useEffect, useId, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Loader2 } from "lucide-react";

interface KYCUploadFieldProps {
  label: string;
  bucket: string;
  userId: string;
  docKey: string;
  onUploaded: (fileUrl: string, fileName: string, mimetype: string) => void;
  existingUrl?: string;
  existingName?: string;
  existingType?: string;
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
const EXTENSION_BY_MIME: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };
const MIME_ALIASES: Record<string, string> = { "image/jpg": "image/jpeg", "application/x-pdf": "application/pdf" };

function getKycObjectPath(value: string | undefined, bucket: string): string {
  if (!value) return "";
  if (!/^https?:\/\//i.test(value)) return value;

  // Support legacy rows that stored a public URL before this private-bucket fix.
  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
  ];
  const marker = markers.find((candidate) => value.includes(candidate));
  if (!marker) return "";
  try {
    return decodeURIComponent(value.split(marker)[1].split("?")[0]);
  } catch {
    return value.split(marker)[1].split("?")[0];
  }
}

const KYCUploadField: React.FC<KYCUploadFieldProps> = ({
  label, bucket, userId, docKey, onUploaded, existingUrl, existingName, existingType
}) => {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(existingUrl || "");
  const [selectedFileName, setSelectedFileName] = useState(existingName || "");
  const [uploadedMimeType, setUploadedMimeType] = useState(existingType || "");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    let active = true;
    const objectPath = getKycObjectPath(existingUrl, bucket);
    if (!objectPath) {
      setUploadedUrl("");
      return () => { active = false; };
    }

    // KYC documents live in a private bucket. Recreate a short-lived URL
    // whenever the form is opened instead of persisting an expiring/public URL.
    void supabase.storage.from(bucket).createSignedUrl(objectPath, 60 * 60).then(({ data, error }) => {
      if (!active) return;
      setUploadedUrl(error ? "" : data.signedUrl);
      if (!error) setSelectedFileName(existingName || objectPath.split('/').pop() || label);
      if (error) setUploadError("This saved document could not be opened. Please select it again.");
    });

    return () => { active = false; };
  }, [existingUrl, existingName, bucket, label]);

    const uploadInProgressRef = useRef(false);

  const detectFileMime = async (file: File): Promise<string> => {
    const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    // Trust the file signature when Android document providers report a generic
    // MIME type or omit the original filename extension.
    if (bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d) return "application/pdf";
    if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
    if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
    return "";
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Keep the DOM input reference before awaiting: React may clear currentTarget
    // after the event callback returns, and Android can suspend the page picker.
    event.preventDefault();
    event.stopPropagation();
    const input = event.currentTarget;
    const file = input.files?.[0] || null;
    if (!file || uploadInProgressRef.current) return;

    uploadInProgressRef.current = true;
    setSelectedFileName(file.name || label);
    setUploadError("");

    try {
      if (file.size > MAX_FILE_SIZE) throw new Error("File must be 4MB or smaller.");
      if (!userId) throw new Error("Your account could not be verified. Please sign in again.");

      const rawExtension = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() || "" : "";
      const declaredMime = (file.type || "").toLowerCase();
      const normalisedMime = MIME_ALIASES[declaredMime] || declaredMime;
      const genericMime = !normalisedMime || normalisedMime === "application/octet-stream";
      const signatureMime = await detectFileMime(file);
      const inferredMime = MIME_BY_EXTENSION[rawExtension] || "";
      const mimeType = signatureMime || (ALLOWED_MIME_TYPES.has(normalisedMime) ? normalisedMime : (genericMime ? inferredMime : ""));
      const extension = EXTENSION_BY_MIME[mimeType] || (rawExtension && MIME_BY_EXTENSION[rawExtension] === mimeType ? rawExtension : "");
      if (!mimeType || !extension || !ALLOWED_MIME_TYPES.has(mimeType)) {
        throw new Error("Choose a valid JPG, PNG, WebP or PDF document.");
      }

      setUploading(true);
      const uniqueId = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const fileName = `${docKey}_${uniqueId}.${extension}`;
      const filePath = `${userId}/${fileName}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: false, contentType: mimeType });
      if (error) throw error;

      const { data, error: signedUrlError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60 * 60);
      if (signedUrlError || !data?.signedUrl) {
        throw signedUrlError || new Error("The document uploaded, but its preview link could not be created. Please refresh your profile before uploading again.");
      }

      setUploadedUrl(data.signedUrl);
      setSelectedFileName(file.name || fileName);
      setUploadedMimeType(mimeType);
      onUploaded(filePath, file.name || fileName, mimeType);
      setUploadError("");
      toast({ title: "Upload successful", description: `${label} uploaded.` });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Please try again.";
      setUploadError(message);
      toast({ title: "Upload failed", description: message, variant: "destructive" });
    } finally {
      setUploading(false);
      uploadInProgressRef.current = false;
      // Clear the picker value only after processing; this permits selecting the
      // same file again without resetting any profile fields.
      input.value = "";
    }
  };

  return (
    <div className="my-2 min-w-0">
      <Label htmlFor={inputId} className="mb-1 block">{label}</Label>
      <div className="flex min-w-0 flex-col gap-3">
        <input
          id={inputId}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => { void handleFileChange(event); }}
          onClick={(event) => event.stopPropagation()}
          disabled={uploading}
          aria-label={`Choose ${label}`}
          aria-describedby={`${inputId}-status`}
          className="block w-full min-w-0 max-w-full cursor-pointer text-sm text-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex min-w-0 items-center gap-2">
          <span id={`${inputId}-status`} role="status" aria-live="polite" className="min-w-0 break-all text-xs text-muted-foreground">
            {uploading
              ? `Uploading ${selectedFileName}… Please keep this page open.`
              : uploadedUrl
                ? `Uploaded: ${selectedFileName || label}`
                : selectedFileName || "PDF or image · Maximum 4MB"}
          </span>
          {uploading && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
          {uploadedUrl && !uploading && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Upload complete" />}
        </div>
      </div>
      {uploadError && <p role="alert" className="mt-2 text-sm text-destructive">{uploadError}</p>}
      {uploadedUrl && (
        <div className="mt-3 min-w-0 space-y-2">
          {uploadedMimeType.startsWith("image/") ? (
            <img src={uploadedUrl} alt={`${label} preview`} className="max-h-56 max-w-full rounded-lg border object-contain" />
          ) : uploadedMimeType === "application/pdf" || selectedFileName.toLowerCase().endsWith(".pdf") ? (
            <iframe title={`${label} PDF preview`} src={uploadedUrl} className="h-64 w-full rounded-lg border bg-background" />
          ) : null}
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="block break-all text-sm text-blue-600 underline">
            Open uploaded document
          </a>
        </div>
      )}
    </div>
  );
};

export default KYCUploadField;
