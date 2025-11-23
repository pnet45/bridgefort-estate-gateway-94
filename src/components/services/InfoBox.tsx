import React, { ReactNode } from 'react';
import { CheckCircle } from 'lucide-react';
import { motion } from "framer-motion";

interface InfoBoxProps {
  icon: ReactNode;
  title: string;
  description: string[];
  checkPoints: string[];
  footer: string;
  accentColorClass?: string;
  extraContent?: ReactNode;
}

const InfoBox = ({
  icon,
  title,
  description,
  checkPoints,
  footer,
  accentColorClass = "text-estate-blue",
  extraContent
}: InfoBoxProps) => {
  return (
    <motion.div 
      className="bg-white p-8 rounded-xl shadow-md"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center mb-6">
        <div className="bg-estate-blue bg-opacity-10 p-3 rounded-full mr-4">
          {icon}
        </div>
        <h3 className="text-2xl font-bold">{title}</h3>
      </div>
      
      {description.map((paragraph, index) => (
        <p key={index} className="text-gray-700 mb-6">{paragraph}</p>
      ))}
      
      {checkPoints.length > 0 && (
        <>
          <h4 className="font-bold text-lg mb-4">Why Choose PWAN Bridgefort?</h4>
          
          <ul className="space-y-2 mb-6">
            {checkPoints.map((point, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle size={20} className={`${accentColorClass} mr-2 mt-1 flex-shrink-0`} />
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      
      <p className="font-medium text-gray-800 mb-4">
        {footer}
      </p>
      
      {extraContent}
    </motion.div>
  );
};

export default InfoBox;
