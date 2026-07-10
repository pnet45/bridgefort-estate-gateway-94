import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { FolderOpen, Upload, Download, Trash2, File, FileText, FileImage, FileArchive, Filter } from 'lucide-react';
import { format } from 'date-fns';

interface SharedFile {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  description: string | null;
  folder: string;
  uploaded_by: string | null;
  is_public: boolean;
  created_at: string;
}

const FOLDERS = ['general', 'documents', 'images', 'reports', 'contracts', 'other'];

const AdminFileSharing = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    try {
      let query = supabase
        .from('admin_shared_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedFolder !== 'all') {
        query = query.eq('folder', selectedFolder);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFiles((data as SharedFile[]) || []);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedFolder]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `admin-files/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      // Save file record
      const { error: insertError } = await supabase
        .from('admin_shared_files')
        .insert({
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          folder: selectedFolder === 'all' ? 'general' : selectedFolder,
          uploaded_by: user?.id,
          is_public: false
        });

      if (insertError) throw insertError;

      toast({ title: "Success", description: "File uploaded successfully" });
      fetchFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const deleteFile = async (file: SharedFile) => {
    try {
      // Extract file path from URL
      const url = new URL(file.file_url);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.indexOf('public');
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        
        // Delete from storage
        await supabase.storage.from('public').remove([filePath]);
      }

      // Delete record
      const { error } = await supabase
        .from('admin_shared_files')
        .delete()
        .eq('id', file.id);

      if (error) throw error;

      toast({ title: "Success", description: "File deleted" });
      fetchFiles();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-8 w-8 text-slate-400" />;
    
    if (fileType.startsWith('image/')) {
      return <FileImage className="h-8 w-8 text-blue-400" />;
    } else if (fileType.includes('pdf') || fileType.includes('document')) {
      return <FileText className="h-8 w-8 text-red-400" />;
    } else if (fileType.includes('zip') || fileType.includes('archive')) {
      return <FileArchive className="h-8 w-8 text-yellow-400" />;
    }
    return <File className="h-8 w-8 text-slate-400" />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            File Sharing
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-32 h-8 text-xs bg-slate-700 border-slate-600">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                <SelectItem value="all" className="text-white">All Files</SelectItem>
                {FOLDERS.map((folder) => (
                  <SelectItem key={folder} value={folder} className="text-white capitalize">
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[350px]">
          {loading ? (
            <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-700 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-400">No files uploaded yet</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    {getFileIcon(file.file_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate" title={file.file_name}>
                        {file.file_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-slate-600 capitalize">
                          {file.folder}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {formatFileSize(file.file_size)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {format(new Date(file.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-white"
                      asChild
                    >
                      <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-300"
                      onClick={() => deleteFile(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AdminFileSharing;
