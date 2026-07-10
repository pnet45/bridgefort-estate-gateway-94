import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import EstateSelect from "./input/EstateSelect";
import DateInput from "./input/DateInput";
import TimeInput from "./input/TimeInput";
import MessageTextarea from "./input/MessageTextarea";

interface InspectionBookingFormProps {
  onBookingCreated?: () => void;
}

const InspectionBookingForm = ({ onBookingCreated }: InspectionBookingFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estates, setEstates] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    estate_name: '',
    inspection_date: '',
    inspection_time: '',
    message: ''
  });

  useEffect(() => {
    fetchEstates();
  }, []);

  const fetchEstates = async () => {
    try {
      const { data, error } = await supabase
        .from('estate')
        .select('name')
        .order('name');

      if (error) {
        console.error('Error fetching estates:', error);
        return;
      }

      setEstates(data || []);
    } catch (error) {
      console.error('Error fetching estates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to book an inspection",
        variant: "destructive"
      });
      return;
    }

    if (!formData.estate_name || !formData.inspection_date || !formData.inspection_time) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('inspection_bookings')
        .insert({
          user_id: user.id,
          email: user.email, // Include the client's email!
          estate_name: formData.estate_name,
          inspection_date: formData.inspection_date,
          inspection_time: formData.inspection_time,
          message: formData.message,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Inspection booked successfully",
        description: "We'll contact you to confirm your inspection appointment"
      });

      // Reset form
      setFormData({
        estate_name: '',
        inspection_date: '',
        inspection_time: '',
        message: ''
      });

      // Call the callback to refresh the bookings list
      if (onBookingCreated) {
        onBookingCreated();
      }

    } catch (error) {
      console.error('Error booking inspection:', error);
      toast({
        title: "Booking failed",
        description: "There was an error booking your inspection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book Property Inspection
        </CardTitle>
        <CardDescription>
          Schedule a visit to view one of our properties
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <EstateSelect
            estates={estates}
            value={formData.estate_name}
            onChange={(value) => handleInputChange("estate_name", value)}
          />
          <DateInput
            min={minDate}
            value={formData.inspection_date}
            onChange={(value) => handleInputChange("inspection_date", value)}
          />
          <TimeInput
            value={formData.inspection_time}
            onChange={(value) => handleInputChange("inspection_time", value)}
          />
          <MessageTextarea
            value={formData.message}
            onChange={(value) => handleInputChange("message", value)}
          />
          <Button 
            type="submit"
            className="w-full bg-estate-blue hover:bg-estate-darkBlue"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Booking...' : 'Book Inspection'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InspectionBookingForm;
