import React, { useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File | null) => void | Promise<void>;
  file: File | null;
  acceptedTypes?: string;
  disabled?: boolean;
  uploading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileSelect,
  file,
  acceptedTypes = ".pdf,.doc,.docx",
  disabled = false,
  uploading = false,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputId = useId();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Some Android document providers expose a temporary content:// backed File.
    // Keep the native input value intact until the asynchronous upload has read
    // the file; clearing it synchronously can invalidate that provider handle.
    const selectedFile = event.currentTarget.files?.[0] || null;
    if (!selectedFile) return;

    try {
      const result = onFileSelect(selectedFile);
      void Promise.resolve(result).finally(() => {
        // Reset after the consumer has finished reading/uploading the File so
        // the same document can be selected again after either success or failure.
        if (inputRef.current) inputRef.current.value = "";
      });
    } catch (error) {
      if (inputRef.current) inputRef.current.value = "";
      throw error;
    }
  };

  const handleRemoveFile = () => {
    if (disabled || uploading) return;
    void onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-5 text-center transition-colors hover:border-estate-blue/50 sm:p-6">
        <input
          ref={inputRef}
          type="file"
          id={inputId}
          accept={acceptedTypes}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="sr-only"
          aria-describedby={`${inputId}-hint`}
        />

        {!file ? (
          <div className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-estate-blue/10">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-estate-blue" aria-hidden="true" />
              ) : (
                <Upload className="h-6 w-6 text-estate-blue" aria-hidden="true" />
              )}
            </div>
            <div className="text-sm text-foreground">
              <label
                htmlFor={inputId}
                className={`font-semibold text-estate-blue ${disabled || uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:underline"}`}
              >
                {uploading ? "Uploading resume…" : "Choose a file"}
              </label>
              {!uploading && <span className="text-muted-foreground"> or select it from your device</span>}
            </div>
            <p id={`${inputId}-hint`} className="text-xs text-muted-foreground">
              PDF, DOC or DOCX · Maximum file size: 10 MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 text-left">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-estate-blue/10">
                <FileIcon />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · Uploaded</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveFile}
              disabled={disabled || uploading}
              aria-label="Remove uploaded resume"
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X size={18} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const FileIcon = () => (
  <svg className="h-5 w-5 text-estate-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v6h5M8 14h8M8 17h6" />
  </svg>
);
