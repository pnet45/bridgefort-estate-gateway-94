import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface EstateSubscriptionFormProps {
  estateName: string;
  subFormPdf?: string;
}

const EstateSubscriptionForm = ({ estateName, subFormPdf }: EstateSubscriptionFormProps) => {
  const handleDownload = () => {
    if (subFormPdf) {
      const link = document.createElement('a');
      link.href = subFormPdf;
      link.download = `${estateName}_subscription_form.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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