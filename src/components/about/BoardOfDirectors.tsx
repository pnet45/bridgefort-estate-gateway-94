
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const boardOfDirectors = [{
  name: 'Dr. Austin Onwumere',
  role: 'Founding Chairman, PWAN Group',
  imageUrl: '/lovable-uploads/AUGUSTIN-OWUNMERE.png'
}, {
  name: 'Dr. Jayne Onwumere',
  role: 'Global President, PWAN Group',
  imageUrl: '/lovable-uploads/Jane-Owunmere.jpg'
}, {
  name: 'Dr. Michael Okonkwo',
  role: 'Executive Chairman, PWAN Group',
  imageUrl: '/lovable-uploads/5a69cf4b-e9ca-477d-bf00-2ac6fa768177.jpg'
}, {
  name: 'Dr. Michael Akhuetie',
  role: 'Chairman, PWAN Bridgefort',
  imageUrl: '/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg'
}, {
  name: 'Dr. Dalvin Silva, PhD',
  role: 'Managing Director, PWAN Bridgefort',
  imageUrl: '/lovable-uploads/Dalvin-Silva-MD.png'
}, {
  name: 'Precious Silva',
  role: 'Executive Director, PWAN Bridgefort',
  imageUrl: '/lovable-uploads/c38e476b-49df-4b14-a2e9-d78048192d53.png'
}];

const BoardOfDirectors = () => {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">MEET OUR BOARD OF DIRECTORS</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our distinguished board brings decades of industry expertise and strategic vision.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boardOfDirectors.map((director, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <Avatar className="mx-auto mb-4 h-32 w-32">
                <AvatarImage src={director.imageUrl} alt={director.name} className="object-cover" />
                <AvatarFallback>{director.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold mb-2">{director.name}</h3>
              <p className="text-estate-blue">{director.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BoardOfDirectors;
