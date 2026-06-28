
import React from 'react';

const TrainingHero = () => {
  return (
    <section className="relative pt-16 lg:pt-20">
      <div className="h-[40vh] bg-cover bg-center" style={{
        backgroundImage: 'url(/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg)'
      }}>
        <div className="absolute inset-0 hero-overlay flex items-center">
          <div className="container-custom text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">Bridgefort Homes Development Ltd Training Academy</h1>
            <p className="text-xl max-w-2xl">Equipping real estate professionals with knowledge, skills, and strategies for exceptional success in the industry.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrainingHero;
