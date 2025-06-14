
import React from "react";

const announcementItems = [
  {
    title: "Join Our Team: We're Hiring Marketing & Sales Executives",
    text: "We are recruiting goal-driven and passionate Marketing and Sales Executives for immediate employment (remuneration is very attractive: basic salary and commissions).",
    img: "/lovable-uploads/ba3b8490-e83f-477b-b729-b617da515b2c.png",
    cta: { label: "Apply Now", url: "/career" }
  },
  {
    title: "PWAN Bridgefort Company News",
    text: "Congratulations to our outstanding staff and partners for record-breaking property sales in 2025!",
    img: "/lovable-uploads/Bridgefort County - Ikota .jpg",
    cta: null
  }
];

const FeaturedAnnouncements = () => (
  <section className="py-10 bg-white">
    <div className="container-custom">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Featured Announcements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {announcementItems.map((item, i) => (
          <div key={i} className="rounded-lg overflow-hidden shadow bg-gray-50 flex flex-col md:flex-row transition-all">
            <div className="md:w-1/3 h-44 md:h-52 overflow-hidden">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="md:w-2/3 p-6 flex flex-col">
              <h3 className="font-bold text-xl text-estate-blue mb-2">{item.title}</h3>
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

export default FeaturedAnnouncements;
