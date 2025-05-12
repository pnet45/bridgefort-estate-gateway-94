
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const subscriptionSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" })
});

const BREVO_API_KEY = "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";
const BREVO_LIST_ID = 2;

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedInput = subscriptionSchema.parse({ email });
      setIsSubmitting(true);
      
      // Use the Brevo API directly via fetch
      const response = await fetch('https://api.sendinblue.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': BREVO_API_KEY
        },
        body: JSON.stringify({
          email: validatedInput.email,
          listIds: [BREVO_LIST_ID],
          updateEnabled: true
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Successfully subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        });
        setEmail('');
      } else if (response.status === 400 && data.message && data.message.includes('already exists')) {
        // If the contact already exists, update their list subscription
        const updateResponse = await fetch(`https://api.sendinblue.com/v3/contacts/${encodeURIComponent(validatedInput.email)}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': BREVO_API_KEY
          },
          body: JSON.stringify({
            listIds: [BREVO_LIST_ID],
            emailBlacklisted: false
          })
        });
        
        if (updateResponse.ok) {
          toast({
            title: "Successfully subscribed!",
            description: "You've been successfully added to our newsletter.",
          });
          setEmail('');
        } else {
          throw new Error('Error updating existing contact');
        }
      } else {
        throw new Error(data.message || 'Error connecting to newsletter service');
      }
      
      // Send a copy to admin@pwanbridgefort.ng as a fallback
      const mailtoLink = `mailto:admin@pwanbridgefort.ng?subject=Newsletter Subscription&body=Please add this email address to the newsletter: ${validatedInput.email}`;
      window.open(mailtoLink, '_blank');
      
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Subscription Failed",
          description: "There was an error subscribing to the newsletter. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <Input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-grow bg-white"
        required
      />
      <Button 
        type="submit" 
        className="bg-estate-red hover:bg-red-700 text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
};

export default NewsletterForm;
