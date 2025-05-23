
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const { data: existingSubscriber } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', email)
        .single();
      
      if (existingSubscriber) {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter."
        });
        setEmail('');
        return;
      }
      
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          { 
            email,
            subscribed_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Success!",
        description: "You've been added to our newsletter."
      });
      
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem subscribing to the newsletter. Please try again.",
        variant: "destructive"
      });
      console.error("Newsletter subscription error:", error);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
      <Input
        type="email"
        placeholder="Enter your email"
        className="bg-white p-3 rounded-lg focus:ring-2 focus:ring-estate-blue focus:border-estate-blue hover:scale-105 transition-all duration-300"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Button 
        type="submit" 
        className="bg-estate-blue hover:bg-estate-darkBlue text-white px-6 py-2 md:py-0 hover:scale-105 transition-all duration-300" 
        disabled={submitting}
      >
        {submitting ? 'Subscribing...' : 'Subscribe'}
      </Button>
    </form>
  );
};

export default NewsletterForm;
