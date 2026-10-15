
import React from 'react';

const YouTubeSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-estate-blue">Bridgefort Homes Development Ltd TV</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Watch our latest property videos and get insights into our premium estates and investment opportunities.
          </p>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/MJE8Xf-4NrI"
                title="BRIDGEFORT HOMES DEVELOPMENT LTD TV - Precious Gardens Scheme 1 Ext"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="absolute left-0 top-0 h-full w-full"
              ></iframe>
            </div>
            <div className="mt-6 text-center">
              <a
                href="https://www.youtube.com/channel/UCVbIQ-DtquiiZeTzjr2phdA"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Bridgefort Homes on YouTube"
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                Visit Our YouTube Channel
              </a>
              <p className="mt-2 text-sm text-gray-600">@bridgeforthomes</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YouTubeSection;
