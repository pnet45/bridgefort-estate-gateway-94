import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface FullArticleDialogProps {
  open: boolean;
  onClose: () => void;
  article: {
    id: string;
    title: string;
    content: string;
    category: string;
    date: string;
    readTime?: number;
    image?: string;
  } | null;
}

const FullArticleDialog = ({ open, onClose, article }: FullArticleDialogProps) => {
  if (!article) return null;

  const formatContent = (content: string) => {
    // Convert markdown-like content to HTML
    return content
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-estate-blue">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-estate-blue">$2</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-estate-brown">$3</h3>')
      .replace(/^\* (.*$)/gm, '<li class="mb-1">$1</li>')
      .replace(/^- (.*$)/gm, '<li class="mb-1">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{article.category}</Badge>
              <div className="flex items-center text-sm text-gray-500 space-x-3">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{new Date(article.date).toLocaleDateString()}</span>
                </div>
                {article.readTime && (
                  <div className="flex items-center space-x-1">
                    <Clock size={14} />
                    <span>{article.readTime} min read</span>
                  </div>
                )}
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-estate-blue text-left">
              {article.title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-4">
            {article.image && (
              <img 
                src={article.image} 
                alt={article.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: `<p class="mb-4">${formatContent(article.content)}</p>` 
              }}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FullArticleDialog;