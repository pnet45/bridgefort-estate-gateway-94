
import React, { useState } from "react";

const stories = [
  {
    title: "Success Summit 2025: Transforming Real Estate Careers",
    img: "/lovable-uploads/Summit1.jpg",
    summary: "Hundreds of PBOs gathered for an unforgettable training session – with many securing new partnerships and hitting new sales milestones right at the Summit!",
  },
  {
    title: "Celebrating Our Top Performer Ifeanyi Okongwu",
    img: "/lovable-uploads/Ify.jpg/",
    summary: "We're proud to recognize Ifeanyi Okongwu, one of PWAN's star business owners, for his outstanding sales achievement of 8 plots at Precious Gardens under Bridgefort Homes Development Ltd. Ifeanyi's success stems from his expert market knowledge, client trust, and dedication to PWANs vision. His performance sets a shining example for our network, proving what's possible through hard work and commitment. Join us in celebrating this milestone! His story inspires us all to keep pushing boundaries in real estate!",
  },
  {
    title: "🎉 Ambassadorial Honor to Our Q2 Sales Hero – Amb. Emeka! 🎖️",
    img: "/lovable-uploads/Amb Emeka.png",
    summary: "At Bridgefort Homes Development Ltd, we believe that extraordinary commitment and outstanding results deserve extraordinary recognition. Today, we are proud to announce Ambassador Emeka as our Q2 Sales Hero, honored with the prestigious title of Bridgefort Homes Development Ltd Ambassador. Amb. Emeka’s relentless drive, professionalism, and passion for helping clients secure their dream properties have set a new standard for excellence in our team. Throughout the second quarter, he not only surpassed his sales targets but also exemplified the core values of integrity, dedication, and customer-first service that define our brand. This ambassadorial honor reflects our appreciation of Amb. Emeka’s unwavering contributions and celebrates his role in driving our mission to make land ownership accessible, convenient, and rewarding for all. Join us in congratulating Amb. Emeka for this remarkable achievement. His success story inspires us all to aim higher and work together toward rebuilding the future, one satisfied client at a time!",
  },
  {
    title: "Bridgefort Homes Development Ltd Honors Top Sales Performer Gideon Vincent for Q1 2025 Excellence",
    img: "/lovable-uploads/GV.png",
    summary: "We are thrilled to celebrate Gideon Vincent, our outstanding staff member and top sales performer for Q1 2025! Gideon's exceptional dedication and results-driven approach have earned him well-deserved recognition and reward packages from PWAN. Through his strategic client engagement and deep market expertise, Gideon has consistently delivered remarkable sales performance, setting a high standard for excellence. His achievement reflects PWAN's culture of hard work, innovation, and success. Join us in congratulating Gideon for this milestone! His accomplishment inspires our entire team to strive for greatness.",
  }
];

const SuccessStories = () => {
  const [expandedStory, setExpandedStory] = useState<number | null>(null);

  const toggleExpanded = (index: number) => {
    setExpandedStory(expandedStory === index ? null : index);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <section className="py-10 bg-white">
      <div className="container-custom">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stories.map((s, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-estate-blue/30 transform hover:-translate-y-1"
            >
              <div className="h-48 sm:h-56 overflow-hidden">
                <img 
                  src={s.img} 
                  alt={s.title} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="font-bold text-lg sm:text-xl text-estate-blue mb-3 leading-tight">
                  {s.title}
                </h3>
                <div className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  <p>
                    {expandedStory === idx 
                      ? s.summary 
                      : truncateText(s.summary, 150)
                    }
                  </p>
                  {s.summary.length > 150 && (
                    <button
                      onClick={() => toggleExpanded(idx)}
                      className="mt-3 text-estate-blue hover:text-estate-darkBlue font-medium text-sm underline transition-colors duration-200"
                    >
                      {expandedStory === idx ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
