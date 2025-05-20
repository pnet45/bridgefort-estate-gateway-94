
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BlogNewsletter = () => {
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
      // Check if the email already exists
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
      
      // Submit to database
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          { 
            email,
            subscribed_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
      
      // Show success message
      toast({
        title: "Success!",
        description: "You've been added to our newsletter."
      });
      
      // Clear form
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
    <section className="py-16 bg-estate-blue">
      <div className="container-custom">
        <div className="bg-white p-8 md:p-12 rounded-lg shadow-lg max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-estate-blue">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest news, property listings, investment tips, and training events from PWAN Bridgefort.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <Input 
              type="email" 
              placeholder="Your email address" 
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-estate-blue"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="bg-estate-red hover:bg-red-700 text-white font-medium py-3 px-6"
              disabled={submitting}
            >
              {submitting ? 'Subscribing...' : 'Subscribe Now'}
            </Button>
          </form>
          
          <p className="text-xs text-gray-500 mt-4 text-center">
            By subscribing, you agree to receive emails from PWAN Bridgefort. You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogNewsletter;
