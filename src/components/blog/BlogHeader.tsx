
import React from 'react';

const BlogHeader = () => {
  return (
    <section className="relative">
      <div className="h-[40vh] bg-cover bg-center" style={{
        backgroundImage: 'url(/lovable-uploads/984f2569-d567-46c5-a58e-7de931171e95.jpg)'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
          <div className="container-custom text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">PWAN Bridgefort Blog</h1>
            <p className="text-xl max-w-2xl">
              Stay updated with the latest trends, events, and opportunities in Nigerian real estate.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogHeader;
