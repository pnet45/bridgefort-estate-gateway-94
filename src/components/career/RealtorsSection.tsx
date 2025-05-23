
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, ExternalLink, Image, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Estate {
  id: string;
  name: string;
  media: string[];
  location: string;
}

const RealtorsSection = () => {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEstates();
  }, []);

  const fetchEstates = async () => {
    try {
      const { data, error } = await supabase
        .from('estate')
        .select('id, name, media, location');
      
      if (error) throw error;
      setEstates(data || []);
    } catch (error) {
      console.error('Error fetching estates:', error);
    }
  };

  const handleDownloadImage = (imageUrl: string, estateName: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${estateName.replace(/\s+/g, '_')}_image.jpg`;
    link.target = '_blank';
    link.click();
  };

  const handleDownloadSubscriptionForms = () => {
    const link = document.createElement('a');
    link.href = '/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf';
    link.download = 'Subscription-Forms.pdf';
    link.click();
  };

  const EstateImagesDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-estate-blue to-purple-600 hover:from-estate-darkBlue hover:to-purple-700 hover:scale-105 transition-all duration-300 focus:scale-105 focus:ring-2 focus:ring-orange-500"
        >
          <Download size={16} className="mr-2" />
          Download Images
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Estate Images</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {estates.map((estate) => (
            <div key={estate.id} className="bg-gray-50 p-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
              <h3 className="font-semibold mb-2 text-estate-blue">{estate.name}</h3>
              <p className="text-sm text-gray-600 mb-3">{estate.location}</p>
              {estate.media && estate.media.length > 0 ? (
                <div className="space-y-2">
                  {estate.media.slice(0, 2).map((imageUrl, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Image size={16} className="mr-2 text-green-600" />
                        <span className="text-xs">Image {index + 1}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadImage(imageUrl, estate.name)}
                        className="hover:scale-105 transition-all duration-300"
                      >
                        <Download size={12} />
                      </Button>
                    </div>
                  ))}
                  {estate.media.length > 2 && (
                    <p className="text-xs text-gray-500">+{estate.media.length - 2} more images</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No images available</p>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  const SubscriptionFormsDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="bg-gradient-to-r from-green-600 to-estate-blue hover:from-green-700 hover:to-estate-darkBlue hover:scale-105 transition-all duration-300 focus:scale-105 focus:ring-2 focus:ring-purple-500"
        >
          <FileText size={16} className="mr-2" />
          Download Forms
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscription Forms</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-estate-blue">Fortress Hills Estate</h3>
                <p className="text-sm text-gray-600">Subscription Form (Phase 1 & 2)</p>
              </div>
              <Button
                size="sm"
                onClick={handleDownloadSubscriptionForms}
                className="hover:scale-105 transition-all duration-300"
              >
                <Download size={16} className="mr-1" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <section className="py-16 bg-white animate-fade-in" id="realtors-section">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 animate-scale-in bg-gradient-to-r from-estate-blue to-purple-600 bg-clip-text text-transparent">For Realtors</h2>
          <p className="text-gray-600 max-w-2xl mx-auto animate-fade-in">
            Access exclusive resources and tools to help you succeed in your real estate career with PWAN Bridgefort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Download Estate Images */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg text-center hover:shadow-xl transition-all duration-300 hover:scale-105 focus-within:scale-105 focus-within:ring-2 focus-within:ring-green-500 animate-fade-in">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 bg-opacity-10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <Download size={32} className="text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-estate-blue">Estate Images</h3>
            <p className="text-gray-600 mb-4">
              Download high-quality images of all our estates for your marketing materials.
            </p>
            <EstateImagesDialog />
          </div>

          {/* Download Subscription Forms */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg text-center hover:shadow-xl transition-all duration-300 hover:scale-105 focus-within:scale-105 focus-within:ring-2 focus-within:ring-purple-500 animate-fade-in">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 bg-opacity-10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <FileText size={32} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-estate-blue">Subscription Forms</h3>
            <p className="text-gray-600 mb-4">
              Get the latest subscription forms for all our properties and estates.
            </p>
            <SubscriptionFormsDialog />
          </div>

          {/* Become a PBO */}
          <div className="bg-gradient-to-br from-purple-600 to-estate-darkBlue p-6 rounded-lg text-center text-white hover:shadow-xl transition-all duration-300 hover:scale-105 focus-within:scale-105 focus-within:ring-2 focus-within:ring-orange-500 animate-fade-in">
            <div className="bg-white bg-opacity-20 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <ExternalLink size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Become a PBO</h3>
            <p className="text-gray-200 mb-4">
              Join the Professional Body of Realtors and advance your career to the next level.
            </p>
            <Button 
              asChild
              variant="secondary"
              className="bg-white text-estate-blue hover:bg-gray-100 hover:scale-105 transition-all duration-300 focus:scale-105 focus:ring-2 focus:ring-red-500"
            >
              <a 
                href="https://portal.pboworld.com/44641" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink size={16} className="mr-2" />
                Become a PBO
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-12 text-center animate-fade-in">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg max-w-3xl mx-auto hover:shadow-xl transition-all duration-300 hover:scale-105 focus-within:scale-105 focus-within:ring-2 focus-within:ring-green-500">
            <h3 className="text-xl font-semibold mb-3 text-estate-blue">Need Additional Resources?</h3>
            <p className="text-gray-600 mb-4">
              Contact our team for additional marketing materials, training resources, or partnership opportunities.
            </p>
            <Button 
              asChild
              className="bg-gradient-to-r from-estate-blue to-green-600 hover:from-estate-darkBlue hover:to-green-700 hover:scale-105 transition-all duration-300 focus:scale-105 focus:ring-2 focus:ring-purple-500"
            >
              <a href="/contact">
                Contact Our Team
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealtorsSection;
