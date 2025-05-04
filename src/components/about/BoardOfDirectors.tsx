
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const boardOfDirectors = [{
  name: 'Dr. Austin Onwumere',
  role: 'Founding Chairman, PWAN Group',
  imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
}, {
  name: 'Dr. Jayne Onwumere',
  role: 'Global President, PWAN Group',
  imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
}, {
  name: 'Dr. Michael Okonkwo',
  role: 'Executive Chairman, PWAN Group',
  imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
}, {
  name: 'Dr. Michael Akhuetie',
  role: 'Chairman, PWAN Bridgefort',
  imageUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
}, {
  name: 'Dr. Dalvin Silva, PhD',
  role: 'Managing Director, PWAN Bridgefort',
  imageUrl: './lovable-uploads/faf1fc01-6f49-4c4a-a9dc-9fd2a8bdbcff.png'
}, {
  name: 'Precious Silva',
  role: 'Executive Director, PWAN Bridgefort',
  imageUrl: './lovable-uploads/13bdaa8e-3bbb-4a80-85ad-ee6c75f45ad8.png'
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
