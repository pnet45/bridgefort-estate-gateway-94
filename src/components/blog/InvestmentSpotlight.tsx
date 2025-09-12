
import React from "react";

const investmentItems = [
  {
    title: "Bridgefort County Ikota - Promo!",
    img: "/lovable-uploads/Bridgefort County - Ikota .jpg",
    text: "Discover Bridgefort County at Ikota – Lagoon front living, premium amenities and the opportunity to own your dream home in Lagos! Now with special launch prices.",
    cta: { label: "Explore Property", url: "/properties" }
  },
  {
    title: "Precious Gardens Estate: New Phase Just Launched",
    img: "/lovable-uploads/Precious Gardens Estate.jpg",
    text: "Our most affordable estate is now open for subscription! Secure your plot at introductory rates in Precious Gardens Estate and enjoy great future returns.",
    cta: { label: "View Details", url: "/properties" }
  }
];

const InvestmentSpotlight = () => (
  <section className="py-10 bg-gray-50">
    <div className="container-custom">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Investment Spotlight</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {investmentItems.map((item, i) => (
          <div key={i} className="rounded-lg shadow overflow-hidden bg-white flex flex-col md:flex-row transition">
            <div className="md:w-1/3 h-44 md:h-52 overflow-hidden">
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-cover" 
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/lovable-uploads/PropertyHero.png';
                }}
              />
            </div>
            <div className="md:w-2/3 p-6 flex flex-col">
              <h3 className="font-bold text-xl md:text-2xl text-estate-blue mb-2">{item.title}</h3>
              <p className="text-gray-700 mb-3">{item.text}</p>
              {item.cta && (
                <a href={item.cta.url}
                  className="self-start bg-estate-blue text-white px-4 py-2 rounded shadow hover:bg-estate-blue/90 text-sm font-medium"
                >{item.cta.label}</a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default InvestmentSpotlight;
