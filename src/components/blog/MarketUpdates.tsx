
import React from "react";

const updates = [
  {
    title: "Market Update: Igbogun/Ebute-Okun Prices Rise",
    img: "/lovable-uploads/d6f71783-c6ac-4ff8-885e-f4290eba3780.png",
    details: "Our Igbogun and Ebute-Okun sites have seen price appreciation by 15% since Q4 2024, making now the perfect time for new investors to secure their plots."
  },
  {
    title: "High Demand in New Estates",
    img: "/lovable-uploads/Precious.png",
    details: "Buyer turnout for the new phase launch of Precious Gardens Estate exceeded expectations – immediate allocation ongoing! Book a site visit today."
  }
];

const MarketUpdates = () => (
  <section className="py-10 bg-gray-50">
    <div className="container-custom">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Market Updates</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {updates.map((u, i) => (
          <div key={i} className="rounded-lg overflow-hidden shadow bg-white flex flex-col md:flex-row">
            <div className="md:w-1/3 h-44 md:h-52 overflow-hidden">
              <img src={u.img} alt={u.title} className="w-full h-full object-cover" />
            </div>
            <div className="md:w-2/3 p-6 flex flex-col">
              <h3 className="font-bold text-xl text-estate-blue mb-2">{u.title}</h3>
              <p className="text-gray-700">{u.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default MarketUpdates;
