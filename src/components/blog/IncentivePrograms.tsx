
import React from "react";

const incentives = [
  {
    name: "2025 Overseas Travel Reward",
    image: "/lovable-uploads/Incentives travel.jpg",
    detail: "Close cumulative sales of ₦100M and above before the end of July 2025 and win an all-expense-paid trip to Dubai or Europe!"
  },
  {
    name: "Luxury Car for Top Performers",
    image: "/lovable-uploads/Incentives car.jpg",
    detail: "This year's best overall PBO receives a brand-new car, after making a cumulative sales of ₦500m. Check requirements in your dashboard or visit our office for more information."
  }
];

const IncentivePrograms = () => (
  <section className="py-10 bg-white">
    <div className="container-custom">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Incentive Programs</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {incentives.map((ic, i) => (
          <div key={i} className="bg-gray-50 rounded-lg shadow flex flex-col md:flex-row items-stretch overflow-hidden">
            <div className="md:w-2/5 h-44 md:h-auto overflow-hidden">
              <img src={ic.image} alt={ic.name} className="w-full h-full object-cover" />
            </div>
            <div className="md:w-3/5 p-6 flex flex-col">
              <h3 className="font-bold text-xl text-estate-blue mb-2">{ic.name}</h3>
              <p className="text-gray-700">{ic.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default IncentivePrograms;
