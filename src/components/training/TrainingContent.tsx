
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Video, Book, Play } from 'lucide-react';

const TrainingContent = () => {
  return (
    <section className="py-16" id="training-content">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Training Resources</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Access our comprehensive library of training materials designed to help you excel in real estate sales and investment.
          </p>
        </div>

        <Tabs defaultValue="masterclass" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <TabsTrigger value="masterclass" className="data-[state=active]:bg-estate-blue data-[state=active]:text-white">Masterclass</TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-estate-red data-[state=active]:text-white">Sales Training</TabsTrigger>
            <TabsTrigger value="closing" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Closing Deals</TabsTrigger>
            <TabsTrigger value="retention" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Customer Retention</TabsTrigger>
          </TabsList>

          {/* Masterclass Content */}
          <TabsContent value="masterclass" id="masterclass">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrainingCard 
                type="video"
                title="Real Estate Market Analysis Masterclass"
                description="Learn how to analyze market trends and identify high-potential investment opportunities."
                image="/lovable-uploads/de82d988-dda1-4526-8001-d88a34fd7090.png"
                date="May 15, 2024"
                duration="1 hour 20 min"
              />
              
              <TrainingCard 
                type="webinar"
                title="Property Portfolio Diversification"
                description="Strategic approaches to building a diversified real estate investment portfolio."
                image="/lovable-uploads/180e436c-ef89-4ab0-a2d1-e6271847b3e9.png"
                date="Friday, 14th November 2025"
                duration="1 hour 45 min"
              />
              
              <TrainingCard 
                type="course"
                title="Advanced ROI Calculation Methods"
                description="Master the mathematics behind real estate investment returns and risk assessment."
                image="/lovable-uploads/22de0a72-5f26-4e48-bf04-b3cb5999d519.png"
                date="April 28, 2024"
                duration="3 hours total"
              />
              
              <TrainingCard 
                type="workshop"
                title="Real Estate Investment Financing"
                description="Explore various financing options and strategies for property acquisition."
                image="/lovable-uploads/b006d931-462b-4646-97c9-0b2f3bc1d210.jpg"
                date="Tuesday, 2nd December 2025"
                duration="2 hours"
              />
              
              <TrainingCard 
                type="video"
                title="Legal Aspects of Real Estate"
                description="Understanding property laws, contracts, and legal compliance in Nigerian real estate."
                image="/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg"
                date="March 22, 2024"
                duration="1 hour 30 min"
              />
              
              <TrainingCard 
                type="ebook"
                title="Wealth Building Through Real Estate"
                description="Comprehensive guide to creating long-term wealth through strategic property investments."
                image="/lovable-uploads/5a69cf4b-e9ca-477d-bf00-2ac6fa768177.jpg"
                date="Available now"
                duration="125 pages"
              />
            </div>
          </TabsContent>

          {/* Sales Training Content */}
          <TabsContent value="sales" id="sales">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrainingCard 
                type="video"
                title="Effective Property Presentation"
                description="Learn how to showcase properties to highlight their best features and attract buyers."
                image="/lovable-uploads/de82d988-dda1-4526-8001-d88a34fd7090.png"
                date="Monday, 8th December 2025"
                duration="55 min"
              />
              
              <TrainingCard 
                type="workshop"
                title="Digital Marketing for Real Estate"
                description="Leveraging social media and online platforms to attract qualified leads."
                image="/lovable-uploads/22de0a72-5f26-4e48-bf04-b3cb5999d519.png"
                date="June 12, 2024"
                duration="1 hour 30 min"
              />
              
              <TrainingCard 
                type="webinar"
                title="Prospecting Techniques"
                description="Strategies for identifying and approaching potential clients in the Nigerian market."
                image="/lovable-uploads/180e436c-ef89-4ab0-a2d1-e6271847b3e9.png"
                date="Thursday, 20th November 2025"
                duration="1 hour"
              />
              
              <TrainingCard 
                type="course"
                title="Sales Psychology for Real Estate"
                description="Understanding client motivations and decision-making processes in property transactions."
                image="/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg"
                date="November 5, 2024"
                duration="4 hours total"
              />
              
              <TrainingCard 
                type="video"
                title="Building Your Personal Brand"
                description="Positioning yourself as a trusted real estate advisor in a competitive market."
                image="/lovable-uploads/b006d931-462b-4646-97c9-0b2f3bc1d210.jpg"
                date="April 20, 2024"
                duration="1 hour 15 min"
              />
              
              <TrainingCard 
                type="ebook"
                title="Sales Scripts that Convert"
                description="Ready-to-use conversational frameworks for different client scenarios."
                image="/lovable-uploads/5a69cf4b-e9ca-477d-bf00-2ac6fa768177.jpg"
                date="Available now"
                duration="87 pages"
              />
            </div>
          </TabsContent>

          {/* Closing Deals Content */}
          <TabsContent value="closing" id="closing">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrainingCard 
                type="video"
                title="Negotiation Masterclass"
                description="Advanced tactics for negotiating favorable terms while maintaining positive relationships."
                image="/lovable-uploads/180e436c-ef89-4ab0-a2d1-e6271847b3e9.png"
                date="March 25, 2024"
                duration="1 hour 40 min"
              />
              
              <TrainingCard 
                type="workshop"
                title="Overcoming Sales Objections"
                description="Strategies for addressing common client concerns and hesitations in real estate."
                image="/lovable-uploads/de82d988-dda1-4526-8001-d88a34fd7090.png"
                date="Friday, 12th December 2025"
                duration="2 hours"
              />
              
              <TrainingCard 
                type="webinar"
                title="Closing Techniques for High-Value Properties"
                description="Specialized approaches for finalizing premium real estate transactions."
                image="/lovable-uploads/22de0a72-5f26-4e48-bf04-b3cb5999d519.png"
                date="Wednesday, 10th December 2025"
                duration="1 hour 20 min"
              />
              
              <TrainingCard 
                type="course"
                title="Transaction Management"
                description="Effectively guiding clients through the complete property acquisition process."
                image="/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg"
                date="August 22, 2024"
                duration="3 hours total"
              />
              
              <TrainingCard 
                type="video"
                title="Creating Urgency Without Pressure"
                description="Ethical approaches to motivating client decision-making in property investments."
                image="/lovable-uploads/b006d931-462b-4646-97c9-0b2f3bc1d210.jpg"
                date="October 5, 2024"
                duration="50 min"
              />
              
              <TrainingCard 
                type="ebook"
                title="The Art of Deal Structuring"
                description="Creative approaches to arranging win-win transactions in challenging situations."
                image="/lovable-uploads/5a69cf4b-e9ca-477d-bf00-2ac6fa768177.jpg"
                date="Available now"
                duration="110 pages"
              />
            </div>
          </TabsContent>

          {/* Customer Retention Content */}
          <TabsContent value="retention" id="retention">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TrainingCard 
                type="video"
                title="Client Relationship Management"
                description="Building systems to maintain strong connections with past clients."
                image="/lovable-uploads/22de0a72-5f26-4e48-bf04-b3cb5999d519.png"
                date="Thursday, 18th December 2025"
                duration="1 hour 10 min"
              />
              
              <TrainingCard 
                type="workshop"
                title="Referral Generation Strategies"
                description="Proven methods for converting satisfied clients into referral sources."
                image="/lovable-uploads/180e436c-ef89-4ab0-a2d1-e6271847b3e9.png"
                date="December 3, 2024"
                duration="1 hour 30 min"
              />
              
              <TrainingCard 
                type="webinar"
                title="Client Appreciation Events"
                description="Planning and executing events that strengthen client relationships."
                image="/lovable-uploads/de82d988-dda1-4526-8001-d88a34fd7090.png"
                date="January 22, 2024"
                duration="1 hour"
              />
              
              <TrainingCard 
                type="course"
                title="Long-term Investment Advisory"
                description="Positioning yourself as a trusted advisor for clients' ongoing real estate needs."
                image="/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg"
                date="Monday, 1st December 2025"
                duration="2 hours total"
              />
              
              <TrainingCard 
                type="video"
                title="Adding Value Beyond the Transaction"
                description="Services and resources that keep you relevant to past clients."
                image="/lovable-uploads/b006d931-462b-4646-97c9-0b2f3bc1d210.jpg"
                date="September 28, 2024"
                duration="45 min"
              />
              
              <TrainingCard 
                type="ebook"
                title="Client Communication Mastery"
                description="Techniques for maintaining meaningful connections with your client base."
                image="/lovable-uploads/5a69cf4b-e9ca-477d-bf00-2ac6fa768177.jpg"
                date="Available now"
                duration="95 pages"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

interface TrainingCardProps {
  type: 'video' | 'webinar' | 'course' | 'workshop' | 'ebook';
  title: string;
  description: string;
  image: string;
  date: string;
  duration: string;
}

const TrainingCard = ({ type, title, description, image, date, duration }: TrainingCardProps) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'video':
      case 'webinar':
        return <Video className="mr-2" size={16} />;
      case 'course':
      case 'workshop':
        return <Play className="mr-2" size={16} />;
      case 'ebook':
        return <Book className="mr-2" size={16} />;
      default:
        return <Video className="mr-2" size={16} />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'video': return 'bg-blue-500';
      case 'webinar': return 'bg-purple-500';
      case 'course': return 'bg-green-500';
      case 'workshop': return 'bg-orange-500';
      case 'ebook': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition duration-300 border-0">
      <div className="relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-48 object-cover" 
        />
        <div className={`absolute top-3 left-3 ${getTypeColor()} text-white text-xs uppercase font-bold py-1 px-2 rounded`}>
          {type}
        </div>
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar size={16} className="mr-2" />
          <span>{date}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          {getTypeIcon()}
          <span>{duration}</span>
        </div>
        
        <button className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white font-medium py-2 px-4 rounded transition duration-300 flex items-center justify-center">
          {type === 'ebook' ? 'Download' : 'Watch Now'} 
          {type !== 'ebook' && <Play size={16} className="ml-2" />}
        </button>
      </CardContent>
    </Card>
  );
};

export default TrainingContent;
