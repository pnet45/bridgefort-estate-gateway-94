
import React from 'react';

// Partner logos data
const partnerLogos = [
  {
    name: 'Adept Lessor Ltd',
    imageUrl: '/lovable-uploads/Adept-lessor.png'
  },
  {
    name: 'Buy2Sell',
    imageUrl: 'https://pwangroupbuytosell.com/assets/LOGO%20BLUE.png'
  },
  {
    name: 'Folkland PDC',
    imageUrl: 'https://scontent.fabb1-3.fna.fbcdn.net/v/t39.30808-6/361313423_604398855113561_7915438463798823659_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGt5RwQptbVkNusjaC8LSfNee4yz5NGUN557jLPk0ZQ3t6ol1cEt5Ezl3q1lfKhTr0&_nc_ohc=SZSZGsmiXEwQ7kNvwGslnLp&_nc_oc=Adn-8YUW9YOc1ldQHnnDMiEc1_C4wrZMiXk3Mq9BQbXmWgb97jPlvs9GIjvfgpGddeY&_nc_zt=23&_nc_ht=scontent.fabb1-3.fna&_nc_gid=bSFu44BKljuILdjP_rRB-g&oh=00_AfFNkb7RH-9-rT7oNMQlqgZ-AJgCnu2fcZHTJdK84ZwqBQ&oe=6818839C'
  },
  {
    name: 'PWAN PBO',
    imageUrl: 'https://pboworld.com/'
  },
  {
    name: 'PWAN Group',
    imageUrl: '/lovable-uploads/pwanlogo.png'
  },
  {
    name: 'Zenith Bank',
    imageUrl: '/lovable-uploads/zenithbank.png'
  }
];

const Partners = () => {
  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Our Trusted Partners</h2>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8 max-w-4xl mx-auto">
          {partnerLogos.map((partner, index) => (
            <div key={index} className="w-40 h-24 relative">
              <img
                src={partner.imageUrl} 
                alt={partner.name}
                className="w-full h-full object-contain transition duration-300 filter grayscale hover:grayscale-0" 
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
