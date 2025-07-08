
import React from "react";

const stories = [
  {
    title: "Success Summit 2025: Transforming Real Estate Careers",
    img: "/lovable-uploads/Summit1.jpg",
    summary: "Hundreds of PBOs gathered for an unforgettable training session – with many securing new partnerships and hitting new sales milestones right at the Summit!",
  },
  {
    title: "Celebrating Our Top Performer Ifeanyi Okongwu",
    img: "/lovable-uploads/Ify.jpg/",
    summary: "We're proud to recognize Ifeanyi Okongwu, one of PWAN's star business owners, for his outstanding sales achievement of 8 plots at Precious Gardens under PWAN Bridgefort. Ifeanyi's success stems from his expert market knowledge, client trust, and dedication to PWANs vision. His performance sets a shining example for our network, proving what's possible through hard work and commitment. Join us in celebrating this milestone! His story inspires us all to keep pushing boundaries in real estate!",
  },
  {
    title: "🎉 Ambassadorial Honor to Our Q2 Sales Hero – Amb. Emeka! 🎖️",
    img: "/lovable-uploads/Amb Emeka.png",
    summary: "At PWAN Bridgefort Estates and Investment Ltd, we believe that extraordinary commitment and outstanding results deserve extraordinary recognition. Today, we are proud to announce Ambassador Emeka as our Q2 Sales Hero, honored with the prestigious title of PWAN Bridgefort Ambassador. Amb. Emeka’s relentless drive, professionalism, and passion for helping clients secure their dream properties have set a new standard for excellence in our team. Throughout the second quarter, he not only surpassed his sales targets but also exemplified the core values of integrity, dedication, and customer-first service that define our brand. This ambassadorial honor reflects our appreciation of Amb. Emeka’s unwavering contributions and celebrates his role in driving our mission to make land ownership accessible, convenient, and rewarding for all. Join us in congratulating Amb. Emeka for this remarkable achievement. His success story inspires us all to aim higher and work together toward rebuilding the future, one satisfied client at a time!",
  },
  {
    title: "PWAN Bridgefort Honors Top Sales Performer Gideon Vincent for Q1 2025 Excellence",
    img: "/lovable-uploads/GV.png",
    summary: "We are thrilled to celebrate Gideon Vincent, our outstanding staff member and top sales performer for Q1 2025! Gideon's exceptional dedication and results-driven approach have earned him well-deserved recognition and reward packages from PWAN. Through his strategic client engagement and deep market expertise, Gideon has consistently delivered remarkable sales performance, setting a high standard for excellence. His achievement reflects PWAN's culture of hard work, innovation, and success. Join us in congratulating Gideon for this milestone! His accomplishment inspires our entire team to strive for greatness.",
  }
];

const SuccessStories = () => (
  <section className="py-10 bg-white">
    <div className="container-custom">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Success Stories</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {stories.map((s, idx) => (
          <div key={idx} className="bg-gray-50 rounded-lg shadow-md flex flex-col md:flex-row">
            <div className="md:w-2/5 h-44 md:h-auto overflow-hidden">
              <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
            </div>
            <div className="md:w-3/5 p-6 flex flex-col">
              <h3 className="font-bold text-xl text-estate-blue mb-2">{s.title}</h3>
              <p className="text-gray-700">{s.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SuccessStories;
