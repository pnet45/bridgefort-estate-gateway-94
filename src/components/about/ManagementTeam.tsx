
import React from 'react';
import { Linkedin, Mail, Phone } from 'lucide-react';

const managementTeam = [{
  name: 'Dalvin Silva, PhD',
  role: 'MD/CEO',
  bio: 'As the Managing Director and Chief Executive Officer, Silva brings visionary leadership and over 15 years of real estate expertise to the company. He oversees strategic planning, growth initiatives, and ensures the delivery of top-tier services to clients.',
  imageUrl: 'public/lovable-uploads/c1401222-0a1b-4598-9b63-56aa7da0f3cf.png',
  social: {
    linkedin: 'https://linkedin.com/Dalvinsilva',
    email: 'dalvin.silva@pwanbridgefort.ng',
    phone: '+234 803 062 4059'
  }
}, {
  name: 'Precious Silva',
  role: 'Chief Operation Officer',
  bio: 'Network marketing guru with expertise in real estate portfolio management and optimization. Mrs Precious ensures smooth daily operations across all departments. With a strong background in operations and project management, she streamlines processes and supports organizational efficiency and innovation.',
  imageUrl: 'public/lovable-uploads/2ee7ad56-4788-4db8-a21d-14c5a54d4eb2.png',
  social: {
    linkedin: 'https://linkedin.com',
    email: 'precious.silva@pwanbridgefort.ng',
    phone: '+234 807 244 0090'
  }
}, {
  name: 'Gideon Vincent',
  role: 'Head of Staff',
  bio: 'Mr Vincent leads the finance and HR departments, managing budgets, financial reporting, and team coordination. His attention to detail and integrity ensures strong fiscal management and a productive workplace.',
  imageUrl: 'public/lovable-uploads/0cc50f44-7003-419d-929e-070762becaf1.png',
  social: {
    linkedin: 'https://linkedin.com',
    email: 'gideon.vincent@pwanbridgefort.ng',
    phone: '+234 803 768 8503'
  }
}];

const ManagementTeam = () => {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">MEET OUR MANAGEMENT TEAM</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Led by industry experts committed to excellence and innovation in real estate.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {managementTeam.map((member, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img 
                src={member.imageUrl} 
                alt={member.name} 
                className="w-full h-80 object-cover object-top"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-estate-blue font-medium mb-4">{member.role}</p>
                <p className="text-gray-700 mb-4">{member.bio}</p>
                
                <div className="flex space-x-3 mt-4">
                  <a href={member.social.linkedin} className="text-gray-500 hover:text-estate-blue transition-colors">
                    <Linkedin size={18} />
                  </a>
                  <a href={`mailto:${member.social.email}`} className="text-gray-500 hover:text-estate-blue transition-colors">
                    <Mail size={18} />
                  </a>
                  <a href={`tel:${member.social.phone}`} className="text-gray-500 hover:text-estate-blue transition-colors">
                    <Phone size={18} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ManagementTeam;
