
import React from 'react';

const YouTubeSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-estate-blue">PWAN Bridgefort TV</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Watch our latest property videos and get insights into our premium estates and investment opportunities.
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden shadow-xl">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/MJE8Xf-4NrI" 
              title="PWAN BRIDGEFORT TV - Precious Gardens Scheme 1 Ext" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
