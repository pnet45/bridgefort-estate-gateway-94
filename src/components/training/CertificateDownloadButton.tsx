import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CertificateDownloadButtonProps {
  attendanceId: string;
  eventTitle: string;
}

const CertificateDownloadButton = ({ attendanceId, eventTitle }: CertificateDownloadButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to download certificate');
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-certificate', {
        body: { attendanceId },
      });

      if (error) throw error;

      // Convert HTML to downloadable file
      const blob = new Blob([data.certificate], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Certificate-${eventTitle.replace(/\s+/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      className="gap-2"
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download Certificate
        </>
      )}
    </Button>
  );
};

export default CertificateDownloadButton;