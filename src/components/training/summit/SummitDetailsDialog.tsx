
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SummitDetailsContent from './SummitDetailsContent';

interface SummitDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SummitDetailsDialog: React.FC<SummitDetailsDialogProps> = ({ isOpen, onClose }) => {
  const handleRegisterClick = () => {
    // Open phone dialer for registration
    window.open('tel:+2348030624059', '_self');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-estate-blue">Wealth Summit 2026</DialogTitle>
        </DialogHeader>
        <SummitDetailsContent onRegisterClick={handleRegisterClick} />
      </DialogContent>
    </Dialog>
  );
};

export default SummitDetailsDialog;
