
import { Star } from 'lucide-react';

interface TestimonialCardProps {
  name: string;
  role: string;
  testimonial: string;
  rating: number;
  imageUrl: string;
}

const TestimonialCard = ({ name, role, testimonial, rating, imageUrl }: TestimonialCardProps) => {
  return (
    <div className="glass-card p-6 rounded-2xl transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-center mb-4">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-estate-purple/30"
        />
        <div>
          <h4 className="text-lg font-semibold text-foreground">{name}</h4>
          <p className="text-muted-foreground text-sm">{role}</p>
        </div>
      </div>
      
      <div className="flex mb-3">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={18} 
            className={i < rating ? "text-estate-gold fill-estate-gold" : "text-muted-foreground/30"} 
          />
        ))}
      </div>
      
      <p className="text-foreground/80 italic">"{testimonial}"</p>
    </div>
  );
};

export default TestimonialCard;
