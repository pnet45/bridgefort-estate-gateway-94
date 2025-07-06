import React from 'react';

// Partner logos data
const partnerLogos = [{
  name: 'Adept Lessor Ltd',
  imageUrl: '/lovable-uploads/Adept-lessor.png'
}, {
  name: 'Buy and Resell',
  imageUrl: '/lovable-uploads/BuytoSell.jpg'
}, {
  name: 'Folkland PDC',
  imageUrl: '/lovable-uploads/folklandPropertiesLtd.png'
}, {
  name: 'PBO',
  imageUrl: '/lovable-uploads/pbo1.jpg'
}, {
  name: 'PWAN Group',
  imageUrl: '/lovable-uploads/pwanlogo.png'
}, {
  name: 'Zenith Bank',
  imageUrl: '/lovable-uploads/zenithbank.png'
}];
const Partners = () => {
  return <section className="py-12 bg-white">
      <div className="container-custom py-0 my-0 mx-0 px-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Our Trusted Partners</h2>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto">
          {partnerLogos.map((partner, index) => <div key={index} className="w-40 h-24 relative">
              <img src={partner.imageUrl} alt={partner.name} className="w-full h-full object-contain transition duration-300 filter grayscale hover:grayscale-0" />
            </div>)}
        </div>
      </div>
    </section>;
};
export default Partners;