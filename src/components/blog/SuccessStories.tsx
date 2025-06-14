
import React from "react";

const stories = [
  {
    title: "Success Summit 2025: Transforming Real Estate Careers",
    img: "/lovable-uploads/ba3b8490-e83f-477b-b729-b617da515b2c.png",
    summary: "Hundreds of agents gathered for an unforgettable training session – with many securing new partnerships and hitting new sales milestones right at the Summit!",
  },
  {
    title: "Sales Leaders Honored",
    img: "/lovable-uploads/GV.png",
    summary: "Our top sales performers for Q1 2025 received recognition and reward packages, including vehicles and all-expenses-paid trips.",
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
