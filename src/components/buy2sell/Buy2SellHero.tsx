import React from 'react';
interface Buy2SellHeroProps {
  backgroundImage: string;
}
const Buy2SellHero: React.FC<Buy2SellHeroProps> = ({
  backgroundImage
}) => {
  return <section className="relative pt-16 lg:pt-20">
      <div className="h-[50vh] bg-cover bg-center" style={{
      backgroundImage: `url(${backgroundImage})`
    }}>
        <div className="absolute inset-0 bg-estate-blue bg-opacity-80 flex items-center">
          <div className="container-custom text-white">
            <h1 className="text-3xl font-bold mb-4 py-[33px] md:text-5xl px-[6px] mx-0 my-[43px]">Buy and Resell Real Estate Trading Platform</h1>
            <p className="text-xl max-w-3xl text-center">Secure, Profitable Real Estate Trading – Tailored Just for You. A revolutionary approach to real estate land banking with guaranteed returns.</p>
          </div>
        </div>
      </div>
    </section>;
};
export default Buy2SellHero;