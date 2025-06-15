
import React from "react";
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
  return (
    <div className="space-y-2">
      <FileUpload
        label="Upload Resume"
        onFileSelect={async (file: File | null) => {
          if (file) {
            const { data, error } = await supabase.storage
              .from('resumes')
              .upload(`${fullName}-${file.name}`, file, {
                cacheControl: '3600',
                upsert: false,
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
              onFileChange(resumeURL);
              toast({
                title: "Resume uploaded successfully!",
                description: "Your resume has been uploaded."
              });
            }
          } else {
            onFileChange('');
          }
        }}
        file={resumeUrl ? new File([], resumeUrl.split('/').pop() || 'resume') : null}
      />
    </div>
  );
}

export default ResumeUploadField;
