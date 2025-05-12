
import React from 'react';

interface SpeakerProfileProps {
  image: string;
  name: string;
  title: string;
  description?: string;
}

const SpeakerProfile: React.FC<SpeakerProfileProps> = ({ image, name, title, description }) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center mb-6 gap-4">
      <div className="w-24 h-24 flex-shrink-0">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full rounded-full object-cover border-2 border-estate-red"
        />
      </div>
      <div>
        <p className="font-bold text-lg">{name}</p>
        <p className="text-gray-600">{title}</p>
        {description && <p className="text-gray-700 mt-2">{description}</p>}
      </div>
    </div>
  );
};

export default SpeakerProfile;
