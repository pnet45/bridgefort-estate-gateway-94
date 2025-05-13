
import React from 'react';

interface Buy2SellHeroProps {
  backgroundImage: string;
}

const Buy2SellHero: React.FC<Buy2SellHeroProps> = ({ backgroundImage }) => {
  return (
    <section className="relative">
      <div className="h-[50vh] bg-cover bg-center" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="absolute inset-0 bg-estate-blue bg-opacity-80 flex items-center">
          <div className="container-custom text-white">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Buy to Sell Real Estate Investment Platform</h1>
            <p className="text-xl max-w-3xl">Secure, Profitable Real Estate Trading – Tailored Just for You. A revolutionary approach to real estate investment with guaranteed returns.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Buy2SellHero;
