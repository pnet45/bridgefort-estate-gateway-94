
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, MapPin, Clock, ChevronDown, ChevronUp, Banknote } from 'lucide-react';

interface Position {
  title: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

const OpenPositions = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  const positions: Position[] = [
    {
      title: 'Estate Manager',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      salary: 'Competitive',
      description: 'We are seeking an experienced Estate Manager to oversee our premium residential and commercial properties. The ideal candidate will have a strong background in property management and exceptional client relationship skills.',
      responsibilities: [
        'Oversee day-to-day operations of multiple estate properties',
        'Coordinate with maintenance teams and security personnel',
        'Handle client inquiries and address resident concerns',
        'Ensure regulatory compliance and maintain property documentation',
        'Conduct regular property inspections and coordinate improvements'
      ],
      requirements: [
        'Bachelor\'s degree in Real Estate Management, Business Administration, or related field',
        '3+ years of experience in estate or property management',
        'Excellent communication and interpersonal skills',
        'Strong organizational and problem-solving abilities',
        'Valid driver\'s license and ability to travel between properties'
      ]
    },
    {
      title: 'Marketing Executive',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      salary: 'Competitive + Commission',
      description: 'We are looking for a results-driven Marketing Executive to join our dynamic team. The successful candidate will play a key role in promoting our real estate offerings and driving sales growth.',
      responsibilities: [
        'Develop and implement strategic marketing campaigns for real estate properties',
        'Create compelling content for digital and traditional marketing channels',
        'Organize and represent the company at real estate exhibitions and events',
        'Generate qualified leads and nurture prospective clients',
        'Analyze market trends and competitor activities'
      ],
      requirements: [
        'Bachelor\'s degree in Marketing, Business, or related field',
        '2+ years of experience in real estate or property marketing',
        'Strong digital marketing skills, including social media management',
        'Excellent communication and presentation abilities',
        'Self-motivated with a proven track record of achieving sales targets'
      ]
    },
    {
      title: 'Customer Service Representative',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      salary: 'Negotiable',
      description: 'We are seeking a dedicated Customer Service Representative to provide exceptional support to our clients. The ideal candidate will be the primary point of contact for clients, addressing inquiries and ensuring a positive experience.',
      responsibilities: [
        'Respond to client inquiries via phone, email, and in person',
        'Assist clients with property information and investment opportunities',
        'Coordinate client visits and property viewings',
        'Maintain accurate client records in our CRM system',
        'Process documentation and follow up on client requests'
      ],
      requirements: [
        'HND or Bachelor\'s degree in Customer Service, Business, or related field',
        '1+ year of experience in customer service, preferably in real estate',
        'Excellent communication and interpersonal skills',
        'Proficiency with CRM software and Microsoft Office suite',
        'Patient, empathetic, and solution-oriented mindset'
      ]
    },
    {
      title: 'Legal Adviser',
      location: 'Lagos, Nigeria',
      type: 'Full-time',
      salary: 'Competitive',
      description: 'We are seeking a qualified Legal Adviser to provide comprehensive legal guidance on real estate transactions, property documentation, and compliance matters. The ideal candidate will have expertise in Nigerian real estate law.',
      responsibilities: [
        'Review and draft property documents, contracts, and agreements',
        'Conduct due diligence on property titles and documentation',
        'Advise management on legal implications of business decisions',
        'Ensure compliance with real estate regulations and property laws',
        'Represent the company in legal proceedings and negotiations when required',
        'Liaise with external legal counsel when necessary'
      ],
      requirements: [
        'Bachelor of Laws (LL.B) degree and qualification as a Nigerian lawyer',
        '3+ years of experience in real estate law or corporate law with focus on property',
        'In-depth knowledge of Nigerian property laws, land use regulations, and title processes',
        'Excellent analytical and problem-solving abilities',
        'Strong communication skills and attention to detail',
        'Ability to work efficiently under pressure and meet deadlines'
      ]
    }
  ];
  
  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  const scrollToApplicationForm = () => {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <section className="bg-gray-50 py-16">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Open Positions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're looking for talented individuals to join our team. Check out our current openings and apply today.
          </p>
        </div>
        
        <div className="space-y-6">
          {positions.map((position, index) => (
            <Card key={index} className={`overflow-hidden transition-all duration-300 ${expandedIndex === index ? 'shadow-lg' : 'shadow-md'}`}>
              <div 
                className="p-6 cursor-pointer flex justify-between items-center"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold">{position.title}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {position.location}
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {position.type}
                    </div>
                    <div className="flex items-center">
                      <Banknote size={16} className="mr-1" />
                      {position.salary}
                    </div>
                  </div>
                </div>
                <div className="text-estate-blue">
                  {expandedIndex === index ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
              </div>
              
              {expandedIndex === index && (
                <CardContent className="pb-6">
                  <div className="border-t border-gray-200 pt-4">
                    <p className="mb-4 text-gray-700">{position.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-lg mb-2">Responsibilities:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {position.responsibilities.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-lg mb-2">Requirements:</h4>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {position.requirements.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-6">
                      <Button 
                        onClick={scrollToApplicationForm}
                        className="bg-estate-blue hover:bg-estate-darkBlue flex items-center"
                      >
                        <Briefcase size={16} className="mr-2" />
                        Apply for this position
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OpenPositions;
