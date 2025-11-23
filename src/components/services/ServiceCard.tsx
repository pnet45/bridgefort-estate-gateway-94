import React, { ReactNode } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface ServiceCardProps {
  imageSrc: string;
  imageAlt: string;
  icon: ReactNode;
  title: string;
  description: string;
  bulletPoints: string[];
  buttonText: string;
}

const ServiceCard = ({
  imageSrc,
  imageAlt,
  icon,
  title,
  description,
  bulletPoints,
  buttonText
}: ServiceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="overflow-hidden shadow-lg border-0">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-2/5">
            <img 
              alt={imageAlt} 
              className="w-full h-64 md:h-full object-cover" 
              src={imageSrc}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/lovable-uploads/PropertyHero.png';
              }}
            />
        </div>
        <div className="md:w-3/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full">
              {icon}
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
          <p className="text-gray-600 mb-4">
            {description}
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-1">
            {bulletPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          <Button className="bg-estate-blue hover:bg-estate-darkBlue text-white mt-2">
            {buttonText}
          </Button>
        </div>
      </div>
    </Card>
    </motion.div>
  );
};

export default ServiceCard;
