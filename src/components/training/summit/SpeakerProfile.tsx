
import React from 'react';

interface SpeakerProfileProps {
  image: string;
  name: string;
  title: string;
  description?: string;
}

const SpeakerProfile: React.FC<SpeakerProfileProps> = ({ image, name, title, description }) => {
  return (
    <div className="flex items-center mb-4">
      <img 
        src={image} 
        alt={name} 
        className="w-16 h-16 rounded-full object-cover mr-4"
      />
      <div>
        <p className="font-bold">{name}</p>
        <p className="text-gray-600">{title}</p>
        {description && <p className="text-gray-700 mt-2">{description}</p>}
      </div>
    </div>
  );
};

export default SpeakerProfile;
