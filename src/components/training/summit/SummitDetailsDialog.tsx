
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SummitDetailsContent from './SummitDetailsContent';

interface SummitDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const SummitDetailsDialog: React.FC<SummitDetailsDialogProps> = ({ isOpen, onClose, onRegisterClick }) => {
  const handleRegisterClick = () => {
    // Close this details popup first, then open the registration form
    // so the two dialogs don't stack on top of each other.
    onClose();
    onRegisterClick();
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
