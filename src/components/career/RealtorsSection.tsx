
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, ExternalLink } from 'lucide-react';

const RealtorsSection = () => {
  const handleDownloadImages = () => {
    // This would typically trigger a download of all estate images
    // For now, we'll show a toast message
    alert('Estate images download will be available soon. Please contact us for the complete package.');
  };

  const handleDownloadSubscriptionForms = () => {
    // Download the existing subscription form
    const link = document.createElement('a');
    link.href = '/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf';
    link.download = 'Subscription-Forms.pdf';
    link.click();
  };

  return (
    <section className="py-16 bg-white animate-fade-in" id="realtors-section">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 animate-scale-in">For Realtors</h2>
          <p className="text-gray-600 max-w-2xl mx-auto animate-fade-in">
            Access exclusive resources and tools to help you succeed in your real estate career with PWAN Bridgefort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Download Estate Images */}
          <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
            <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <Download size={32} className="text-estate-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Estate Images</h3>
            <p className="text-gray-600 mb-4">
              Download high-quality images of all our estates for your marketing materials.
            </p>
            <Button 
              onClick={handleDownloadImages}
              className="bg-estate-blue hover:bg-estate-darkBlue hover:scale-105 transition-all duration-300"
            >
              <Download size={16} className="mr-2" />
              Download Images
            </Button>
          </div>

          {/* Download Subscription Forms */}
          <div className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
            <div className="bg-estate-blue bg-opacity-10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center hover:scale-110 transition-transform duration-300">
              <FileText size={32} className="text-estate-blue" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Subscription Forms</h3>
            <p className="text-gray-600 mb-4">
              Get the latest subscription forms for all our properties and estates.
            </p>
            <Button 
              onClick={handleDownloadSubscriptionForms}
              className="bg-estate-blue hover:bg-estate-darkBlue hover:scale-105 transition-all duration-300"
            >
              <FileText size={16} className="mr-2" />
              Download Forms
            </Button>
          </div>

          {/* Become a PBO */}
          <div className="bg-gradient-to-br from-estate-blue to-estate-darkBlue p-6 rounded-lg text-center text-white hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in">
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
              className="bg-white text-estate-blue hover:bg-gray-100 hover:scale-105 transition-all duration-300"
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
          <div className="bg-gray-50 p-6 rounded-lg max-w-3xl mx-auto hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold mb-3">Need Additional Resources?</h3>
            <p className="text-gray-600 mb-4">
              Contact our team for additional marketing materials, training resources, or partnership opportunities.
            </p>
            <Button 
              asChild
              className="bg-estate-blue hover:bg-estate-darkBlue hover:scale-105 transition-all duration-300"
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
