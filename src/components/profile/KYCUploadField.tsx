
import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

interface KYCUploadFieldProps {
  label: string;
  bucket: string;
  userId: string;
  docKey: string;
  onUploaded: (fileUrl: string, fileName: string, mimetype: string) => void;
  existingUrl?: string;
}

const KYCUploadField: React.FC<KYCUploadFieldProps> = ({
  label, bucket, userId, docKey, onUploaded, existingUrl
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(existingUrl || "");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 4 * 1024 * 1024) {
      toast({ title: "File too large", description: "File < 4MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${docKey}_${userId}_${Date.now()}.${ext}`;
      const filePath = `${userId}/${fileName}`;
      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      setUploadedUrl(data.publicUrl);
      onUploaded(data.publicUrl, fileName, file.type);

      toast({ title: "Upload successful", description: `${label} uploaded.` });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="my-2">
      <Label className="block mb-1">{label}</Label>
      <div className="flex items-center gap-3">
        <Input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={uploading}
        />
        <Button type="button" size="icon" disabled>
          <Upload className="w-5 h-5" />
        </Button>
      </div>
      {uploadedUrl && (
        <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm underline mt-1 block">
          View Uploaded File
        </a>
      )}
    </div>
  );
};

export default KYCUploadField;
