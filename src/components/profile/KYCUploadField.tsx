
import React, { useEffect, useId, useRef, useState } from "react";
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
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(existingUrl || "");

  useEffect(() => {
    setUploadedUrl(existingUrl || "");
  }, [existingUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({ title: "File too large", description: "File must be smaller than 4MB.", variant: "destructive" });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.type)) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast({ title: "Unsupported file", description: "Choose a JPG, PNG, WebP or PDF file.", variant: "destructive" });
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
      <Label htmlFor={inputId} className="mb-1 block">{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={uploading}
          className="sr-only"
        />
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading…" : "Choose file"}
        </Button>
        <span className="min-w-0 break-all text-xs text-muted-foreground">
          {uploadedUrl ? "File uploaded successfully" : "PDF or image · Maximum 4MB"}
        </span>
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
