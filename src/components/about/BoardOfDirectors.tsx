import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const boardOfDirectors = [{
  name: 'Dr. Austin Onwumere',
  role: 'Founding Chairman, PWAN Group',
  imageUrl: '/lovable-uploads/AUGUSTIN-OWUNMERE-DR.png'
}, {
  name: 'Dr. Jayne Onwumere',
  role: 'Global President, PWAN Group',
  imageUrl: '/lovable-uploads/JaneOwunmere.png'
}, {
  name: 'Dr. Michael Okonkwo',
  role: 'Executive Chairman, PWAN Group',
  imageUrl: '/lovable-uploads/2ef7dd06-9cf0-458d-b8a2-9e82f2a5cf26.png'
}, {
  name: 'Dr. Michael Akhuetie',
  role: 'Chairman, PWAN Bridgefort',
  imageUrl: '/lovable-uploads/DR-MICHAEL-AKHUETIE.png'
}, {
  name: 'Dr. Dalvin Silva, PhD',
  role: 'Managing Director, PWAN Bridgefort',
  imageUrl: '/lovable-uploads/Dalvin-Silva-MD.png'
}, {
  name: 'Precious Silva',
  role: 'Executive Director, PWAN Bridgefort',
  imageUrl: '/lovable-uploads/Precious.png'
}];
const BoardOfDirectors = () => {
  return <section className="section-padding bg-opacity-5 bg-[#070f5c]/[0.54]">
      <div className="container-custom">
        <div className="text-center mb-10 bg-white">
          <h2 className="text-3xl font-bold mb-4 text-white">MEET OUR BOARD OF DIRECTORS</h2>
          <p className="max-w-3xl mx-auto text-green-50">
            Our distinguished board brings decades of industry expertise and strategic vision.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardOfDirectors.map((director, index) => <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <Avatar className="mx-auto mb-4 h-40 w-40">
                <AvatarImage src={director.imageUrl} alt={director.name} className="object-cover" />
                <AvatarFallback>{director.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold mb-2">{director.name}</h3>
              <p className="text-estate-blue">{director.role}</p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default BoardOfDirectors;