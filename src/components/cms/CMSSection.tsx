import React from 'react';
import { useContentItems } from '@/hooks/useContentItems';
import type { ContentPage, ContentType } from '@/types/content';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

interface Props {
  page: ContentPage;
  contentType?: ContentType | ContentType[];
  title?: string;
  emptyHidden?: boolean;
  className?: string;
}

const CMSSection: React.FC<Props> = ({ page, contentType, title, emptyHidden = true, className }) => {
  const { items, loading } = useContentItems({ page, contentType });

  if (loading) return null;
  if (emptyHidden && items.length === 0) return null;

  return (
    <section className={`py-12 ${className || ''}`}>
      <div className="container-custom">
        {title && <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {item.image_url && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <CardHeader>
                {item.category && <span className="text-xs uppercase text-primary font-semibold">{item.category}</span>}
                <CardTitle className="text-lg">{item.title}</CardTitle>
                {item.subtitle && <p className="text-sm text-muted-foreground">{item.subtitle}</p>}
              </CardHeader>
              <CardContent className="space-y-3">
                {item.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{item.excerpt}</p>}
                {(item.event_date || item.event_location) && (
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {item.event_date && (
                      <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(item.event_date).toLocaleString()}</span>
                    )}
                    {item.event_location && (
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.event_location}</span>
                    )}
                  </div>
                )}
                {item.body && <div className="text-sm whitespace-pre-wrap line-clamp-4">{item.body}</div>}
                {item.link_url && (
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <a href={item.link_url} target={item.link_url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      {item.cta_label || 'Learn More'} <ArrowRight className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CMSSection;
