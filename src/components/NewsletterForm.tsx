
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import * as Brevo from '@getbrevo/brevo';

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
      
      // Configure Brevo SDK
      const apiInstance = new Brevo.ContactsApi();
      apiInstance.setApiKey(Brevo.ContactsApiApiKeys.apiKey, BREVO_API_KEY);
      
      // Prepare contact data
      const createContact = new Brevo.CreateContact();
      createContact.email = validatedInput.email;
      createContact.listIds = [BREVO_LIST_ID];
      createContact.updateEnabled = true;
      
      try {
        // Try to create a new contact
        await apiInstance.createContact(createContact);
        
        toast({
          title: "Successfully subscribed!",
          description: "Thank you for subscribing to our newsletter.",
        });
      } catch (apiError: any) {
        // If contact already exists, update their list subscription
        if (apiError.status === 400 && apiError.response?.text?.includes('already exists')) {
          try {
            const updateContact = new Brevo.UpdateContact();
            updateContact.listIds = [BREVO_LIST_ID];
            updateContact.emailBlacklisted = false;
            
            await apiInstance.updateContact(validatedInput.email, updateContact);
            
            toast({
              title: "Successfully subscribed!",
              description: "You've been successfully added to our newsletter.",
            });
          } catch (updateError) {
            console.error('Error updating contact:', updateError);
            throw new Error('Error updating existing contact');
          }
        } else {
          console.error('Brevo API Error:', apiError);
          throw new Error(apiError.response?.text || 'Error connecting to newsletter service');
        }
      }
      
      // Send a copy to admin@pwanbridgefort.ng as a fallback
      const mailtoLink = `mailto:admin@pwanbridgefort.ng?subject=Newsletter Subscription&body=Please add this email address to the newsletter: ${validatedInput.email}`;
      window.open(mailtoLink, '_blank');
      
      setEmail('');
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
