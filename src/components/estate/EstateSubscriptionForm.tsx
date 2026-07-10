import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface EstateSubscriptionFormProps {
  estateName: string;
  subFormPdf?: string;
}

const EstateSubscriptionForm = ({ estateName, subFormPdf }: EstateSubscriptionFormProps) => {
  const handleDownload = async () => {
    if (subFormPdf) {
      try {
        const response = await fetch(subFormPdf);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeEstateName = estateName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '_');
        link.download = `${safeEstateName}_Subscription_Form.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        // Fallback: open in new tab
        window.open(subFormPdf, '_blank');
      }
    }
  };

  if (!subFormPdf) {
    return null;
  }

  return (
    <div className="mt-4">
      <Button 
        onClick={handleDownload}
        className="bg-estate-blue hover:bg-estate-darkBlue text-white"
      >
        <Download size={16} className="mr-2" />
        Download Subscription Form
      </Button>
    </div>
  );
};

export default EstateSubscriptionForm;