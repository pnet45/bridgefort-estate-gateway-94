
import React, { useState } from "react";
import { FileUpload } from "./FileUpload";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ResumeUploadFieldProps {
  fullName: string;
  resumeUrl: string;
  onFileChange: (url: string) => void;
}

const ResumeUploadField: React.FC<ResumeUploadFieldProps> = ({
  fullName,
  resumeUrl,
  onFileChange,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  return (
    <div className="space-y-2">
      <FileUpload
        label="Upload Resume"
        onFileSelect={async (file: File | null) => {
          if (file) {
            const safeName = (fullName || 'applicant').trim().replace(/[^a-z0-9_-]+/gi, '-').slice(0, 60) || 'applicant';
            const safeFileName = file.name.replace(/[^a-z0-9._-]+/gi, '-');
            const storagePath = `${safeName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeFileName}`;
            const { data, error } = await supabase.storage
              .from('resumes')
              .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || 'application/octet-stream',
              });
            if (error) {
              console.error('Error uploading file:', error);
              toast({
                title: "Upload failed",
                description: "There was an error uploading your resume. Please try again.",
                variant: "destructive"
              });
            } else if (data) {
              const resumeURL = `https://xyvspvtdaacqfmfocvhw.supabase.co/storage/v1/object/public/resumes/${data.path}`;
              setSelectedFile(file);
              onFileChange(resumeURL);
              toast({
                title: "Resume uploaded successfully!",
                description: "Your resume has been uploaded."
              });
            }
          } else {
            setSelectedFile(null);
            onFileChange('');
          }
        }}
        file={selectedFile || (resumeUrl ? new File([], resumeUrl.split('/').pop() || 'resume') : null)}
      />
    </div>
  );
}

export default ResumeUploadField;
