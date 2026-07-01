import React from "react";
const announcementItems = [
  {
    title: "Bridgefort Homes Development Ltd Delivers Again: Land Allocation at Ode-Omi Estates",
    text: "Successful physical allocation and handover of plots at Precious Gardens Estate and The Ambassadors Parks and Gardens Estate, Ode-Omi, Ogun State. Clients stepped onto their lands with excitement!",
    img: "/images/allocation-1.jpg",
    cta: {
      label: "Read Full Article",
      url: "/blog"
    }
  },
  {
  title: "Bridgefort Homes Development Ltd Celebrates Customer Service Week",
  text: "Exciting value-driven activities from October 6-10, 2025! Join us as we celebrate service excellence with client appreciation visits, recognition events, and special goodwill gestures to our valued investors.",
  img: "/lovable-uploads/Happy new week.png",
  cta: {
    label: "Read Full Press Release",
    url: "/blog/customer-service-week-2025"
  }
}, {
  title: "Physical Allocation - Precious Gardens Estate Scheme 1",
  text: "Your plot has been successfully demarcated and ready for allocation! Allocation Day: Saturday, 20th September 2025 at 9:00 AM. Documents ready for pickup on the same day.",
  img: "/lovable-uploads/9979be2c-1112-4567-bbf9-d036d65b9a61.png",
  cta: {
    label: "Read Full Details",
    url: "/blog"
  }
}, {
  title: "Join Our Team: We're Hiring Marketing & Sales Executives",
  text: "We are recruiting goal-driven and passionate Marketing and Sales Executives for immediate employment (remuneration is very attractive: basic salary and commissions).",
  img: "/lovable-uploads/e36d5fd8-2846-41e4-a03b-16f1a93f04df.png",
  cta: {
    label: "Apply Now",
    url: "/career"
  }
}, {
  title: "Bridgefort Homes Development Ltd Company News",
  text: "Congratulations to our outstanding staff and partners for record-breaking property sales in 2025!",
  img: "/lovable-uploads/Bridgefort County - Ikota .jpg",
  cta: null
}];
const FeaturedAnnouncements = () => <section className="py-10 bg-white">
    <div className="container-custom">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Featured Announcements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {announcementItems.map((item, i) => <div key={i} className="rounded-lg overflow-hidden shadow bg-gray-50 flex flex-col md:flex-row transition-all hover:shadow-lg">
            <div className="md:w-1/3 h-40 sm:h-44 md:h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-full object-contain" 
                loading="lazy"
                decoding="async"
                sizes="(max-width: 768px) 100vw, 33vw"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/lovable-uploads/PropertyHero.png';
                }}
              />
            </div>
            <div className="md:w-2/3 p-4 sm:p-5 md:p-6 flex flex-col">
              <h3 className="font-bold text-base sm:text-lg md:text-xl text-estate-blue mb-2 line-clamp-3">{item.title}</h3>
              <p className="text-gray-700 mb-3 text-sm sm:text-base line-clamp-4">{item.text}</p>
              {item.cta && <a href={item.cta.url} className="self-start bg-estate-blue text-white px-4 py-2 rounded shadow hover:bg-estate-blue/90 text-sm font-medium">{item.cta.label}</a>}
            </div>
          </div>)}
      </div>
    </div>
  </section>;
export default FeaturedAnnouncements;