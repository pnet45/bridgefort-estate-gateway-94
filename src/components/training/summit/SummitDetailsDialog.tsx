
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowRight, X } from 'lucide-react';
import SummitDetailsContent from './SummitDetailsContent';

const SummitDetailsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRegisterClick = () => {
    setIsOpen(false);
    // User can call the registration number or contact
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="border-white text-white hover:bg-white hover:text-estate-blue font-medium py-3 px-8 rounded-lg transition duration-300"
        >
          View Summit Details <ArrowRight className="ml-2" size={16} />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl p-0">
        <div className="relative">
          <img 
            src="/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png" 
            alt="Success Summit 2025" 
            className="w-full h-64 object-cover object-center"
          />
          <DialogClose className="absolute top-2 right-2 bg-estate-blue bg-opacity-75 p-1 rounded-full">
            <X className="text-white" />
          </DialogClose>
          <div className="absolute top-4 left-4 bg-estate-red text-white text-sm uppercase font-bold py-1 px-3 rounded">
            May 2025
          </div>
        </div>
        
        <SummitDetailsContent onRegisterClick={handleRegisterClick} />
      </DialogContent>
    </Dialog>
  );
};

export default SummitDetailsDialog;
