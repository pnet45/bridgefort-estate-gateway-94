import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileCheckDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const ProfileCheckDialog = ({ isOpen, onClose, message }: ProfileCheckDialogProps) => {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    onClose();
    navigate('/profile');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Profile Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-medium">Complete Your Profile</h3>
              <p className="text-sm text-muted-foreground">
                {message}
              </p>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            To ensure compliance with regulations and provide you with the best service, 
            we require all customers to complete their profile before making any purchases.
          </p>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCompleteProfile} className="bg-estate-blue hover:bg-estate-darkBlue">
            Complete Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileCheckDialog;