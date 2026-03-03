
/**
 * Contains the list of open positions (job postings) for the careers page.
 * Used by OpenPositions and PositionCard.
 */
export interface Position {
  title: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

const positions: Position[] = [
  {
    title: 'Inspection Officer',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salary: 'Competitive',
    description: 'We are seeking an experienced Inspection Officer to oversee property inspections and ensure quality standards across our premium residential and commercial properties.',
    responsibilities: [
      'Conduct thorough inspections of estate properties before and after allocation',
      'Coordinate with maintenance teams and security personnel on property conditions',
      'Document inspection findings and prepare detailed reports',
      'Ensure regulatory compliance and maintain property documentation',
      'Schedule and lead client property viewings and site inspections'
    ],
    requirements: [
      "Bachelor's degree in Real Estate Management, Civil Engineering, or related field",
      '3+ years of experience in property inspection or estate management',
      'Excellent communication and interpersonal skills',
      'Strong organizational and problem-solving abilities',
      "Valid driver's license and ability to travel between properties"
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
      "Bachelor's degree in Marketing, Business, or related field",
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
      "HND or Bachelor's degree in Customer Service, Business, or related field",
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
  },
  {
    title: 'Driver',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salary: 'Negotiable',
    description: 'We are looking for a reliable and experienced Driver to support our operations. The ideal candidate will transport staff and clients to property sites, meetings, and events safely and efficiently.',
    responsibilities: [
      'Drive company vehicles to transport staff and clients to property sites and meetings',
      'Maintain vehicle cleanliness and ensure routine maintenance checks',
      'Plan and follow optimal routes for timely arrivals',
      'Ensure safety of passengers and compliance with traffic regulations',
      'Assist with logistics, deliveries, and errands as required'
    ],
    requirements: [
      "Valid driver's license (Class E or equivalent)",
      '3+ years of professional driving experience',
      'Good knowledge of Lagos roads and major routes',
      'Clean driving record with no major violations',
      'Good communication skills and professional demeanor',
      'Basic vehicle maintenance knowledge'
    ]
  }
];

export default positions;
