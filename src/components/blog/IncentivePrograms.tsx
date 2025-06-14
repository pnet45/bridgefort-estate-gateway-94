
import React from "react";

const incentives = [
  {
    name: "2025 Overseas Travel Reward",
    image: "/lovable-uploads/f27b5aee-88b8-457a-ba3a-45bff68f8d85.png",
    detail: "Close three sales above ₦10M each before Dec 2025 and win an all-expense-paid trip to Dubai or Europe!"
  },
  {
    name: "Luxury Car for Top Performers",
    image: "/lovable-uploads/5a69cf4b-e9ca-477d-bf00-2ac6fa768177.jpg",
    detail: "This year’s best overall agent receives a brand-new car. Check requirements in your dashboard."
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
