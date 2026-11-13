import React, { useState } from "react";
import { FileUpload } from "./FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ResumeUploadFieldProps {
  fullName: string;
  resumeUrl: string;
  onFileChange: (url: string) => void;
}

const MAX_RESUME_SIZE = 10 * 1024 * 1024;
const ALLOWED_RESUME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const MIME_TO_EXTENSION: Record<string, keyof typeof ALLOWED_RESUME_TYPES> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.ms-word": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};

const ResumeUploadField: React.FC<ResumeUploadFieldProps> = ({
  resumeUrl,
  onFileChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      if (!isUploading) {
        setSelectedFile(null);
        onFileChange("");
      }
      return;
    }

    const namedExtension = file.name.split(".").pop()?.toLowerCase() || "";
    // Android's system picker can provide a valid MIME type even when the
    // display name has no usable extension. Prefer a supported extension,
    // then fall back to the provider's MIME metadata.
    const extension = ALLOWED_RESUME_TYPES[namedExtension]
      ? namedExtension
      : MIME_TO_EXTENSION[file.type] || "";
    const contentType = ALLOWED_RESUME_TYPES[extension];
    if (!contentType) {
      toast({
        title: "Unsupported file format",
        description: "Please choose a PDF, DOC or DOCX resume.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_RESUME_SIZE) {
      toast({
        title: "File is too large",
        description: "Your resume must be 10 MB or smaller.",
        variant: "destructive",
      });
      return;
    }
    if (file.size === 0) {
      toast({
        title: "Empty file",
        description: "Please choose a resume that contains content.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Do not include applicant names or original filenames in the object key.
      const objectId = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
      const storagePath = `career-applications/${objectId}.${extension}`;

      const { data, error } = await supabase.storage.from("resumes").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType,
      });

      if (error) throw error;
      if (!data?.path) throw new Error("The upload did not return a storage path.");

      // Persist only the private object path in applications.resume_url.
      // Resume documents must never be exposed through a public storage URL.
      onFileChange(data.path);
      setSelectedFile(file);
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume is attached to this application.",
      });
    } catch (error) {
      console.error("Error uploading career resume:", error);
      toast({
        title: "Upload failed",
        description: "Your application details are still here. Please select the resume again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const storedFileName = resumeUrl
    ? decodeURIComponent(resumeUrl.split("/").pop()?.split("?")[0] || "resume")
    : "";
  const displayFile = selectedFile || (storedFileName
    ? new File([], storedFileName)
    : null);

  return (
    <FileUpload
      label="Upload Resume"
      onFileSelect={handleFileSelect}
      file={displayFile}
      disabled={isUploading}
      uploading={isUploading}
      acceptedTypes=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    />
  );
};

export default ResumeUploadField;
