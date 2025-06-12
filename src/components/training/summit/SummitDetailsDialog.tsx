
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SummitDetailsContent from './SummitDetailsContent';

interface SummitDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SummitDetailsDialog: React.FC<SummitDetailsDialogProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-estate-blue">Success Summit 2025</DialogTitle>
        </DialogHeader>
        <SummitDetailsContent />
      </DialogContent>
    </Dialog>
  );
};

export default SummitDetailsDialog;
