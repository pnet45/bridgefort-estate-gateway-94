import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  propertyId: string;
  className?: string;
}

const PropertyRatingBadge: React.FC<Props> = ({ propertyId, className = '' }) => {
  const [avg, setAvg] = useState<number>(1);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('property_reviews')
        .select('rating')
        .eq('property_id', propertyId)
        .is('parent_id', null);
      if (cancelled) return;
      if (data && data.length > 0) {
        const total = data.reduce((s: number, r: any) => s + (r.rating || 0), 0);
        setAvg(Math.max(1, total / data.length));
        setCount(data.length);
      } else {
        setAvg(1);
        setCount(0);
      }
    })();
    return () => { cancelled = true; };
  }, [propertyId]);

  const rounded = Math.round(avg);
  return (
    <div className={`inline-flex items-center gap-1 ${className}`} aria-label={`Rating ${avg.toFixed(1)} out of 5`}>
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            size={14}
            className={s <= rounded ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
      <span className="text-xs text-gray-600 font-medium">
        {avg.toFixed(1)}{count > 0 ? ` (${count})` : ''}
      </span>
    </div>
  );
};

export default PropertyRatingBadge;
