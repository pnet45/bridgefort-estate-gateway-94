
import React from 'react';

const YouTubeSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Featured Videos</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch our latest property showcases and real estate insights on our YouTube channel.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/Ahsv5NQXTUk" 
              title="BRIDGEFORT COUNTY BY BRIDGEFORT HOMES DEVELOPMENT LTD" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-estate-blue">Bridgefort County</h3>
            <p className="text-gray-700">
              Explore our premium lagoon front estate offering exceptional investment opportunities. 
              This exclusive showcase provides a glimpse into luxury living at its finest.
            </p>
            <p className="text-gray-700">
              Located in a prime area with excellent appreciation prospects, Bridgefort County 
              represents one of our most prestigious developments.
            </p>
            <a 
              href="https://www.youtube.com/channel/UCR7M5cJsWUtngHgCNVu93Tw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mt-4 bg-estate-blue text-white px-6 py-2 rounded hover:bg-estate-darkBlue transition duration-300"
            >
              Visit Our YouTube Channel
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
