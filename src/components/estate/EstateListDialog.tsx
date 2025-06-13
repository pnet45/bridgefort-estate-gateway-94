
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { usePropertyContext } from '@/contexts/property';

interface EstateListDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EstateListDialog: React.FC<EstateListDialogProps> = ({ isOpen, onClose }) => {
  const { properties } = usePropertyContext();

  const handleDownloadForm = (estateName: string) => {
    // For now, use the general form. In production, each estate would have its own form
    const link = document.createElement('a');
    link.href = '/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf';
    link.download = `${estateName}-Subscription-Form.pdf`;
    link.click();
  };

  const handleDownloadImage = (imageUrl: string, estateName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${estateName}-Image.jpg`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-estate-blue">Estate Information & Forms</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {properties.map((estate) => (
            <div key={estate.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
              <div className="relative h-32 mb-4 overflow-hidden rounded">
                <img 
                  src={estate.imageUrl} 
                  alt={estate.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
              </div>
              
              <h3 className="text-lg font-semibold text-estate-blue mb-2">{estate.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{estate.location}</p>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleDownloadImage(estate.imageUrl, estate.title)}
                >
                  <Download size={16} />
                  Download Image
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => handleDownloadForm(estate.title)}
                >
                  <Download size={16} />
                  Download Form
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstateListDialog;
