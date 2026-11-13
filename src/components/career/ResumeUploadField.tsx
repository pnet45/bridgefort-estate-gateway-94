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

const ResumeUploadField: React.FC<ResumeUploadFieldProps> = ({
  fullName,
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

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
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
      const safeName =
        (fullName || "applicant").trim().replace(/[^a-z0-9_-]+/gi, "-").slice(0, 60) || "applicant";
      const safeFileName = file.name.replace(/[^a-z0-9._-]+/gi, "-");
      const storagePath = `${safeName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeFileName}`;

      const { data, error } = await supabase.storage.from("resumes").upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType,
      });

      if (error) throw error;
      if (!data?.path) throw new Error("The upload did not return a storage path.");

      const { data: publicUrlData } = supabase.storage.from("resumes").getPublicUrl(data.path);
      onFileChange(publicUrlData.publicUrl);
      setSelectedFile(file);
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume is attached to this application.",
      });
    } catch (error) {
      console.error("Error uploading career resume:", error);
      toast({
        title: "Upload failed",
        description: "Your application details are still here. Please try selecting the resume again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const displayFile = selectedFile || (resumeUrl
    ? new File([], decodeURIComponent(resumeUrl.split("/").pop()?.split("?")[0] || "resume"))
    : null);

  return (
    <FileUpload
      label="Upload Resume"
      onFileSelect={handleFileSelect}
      file={displayFile}
      disabled={isUploading}
      uploading={isUploading}
    />
  );
};

export default ResumeUploadField;
