
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock } from 'lucide-react';

const InspectionBookingForm = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    estate_name: '',
    inspection_date: '',
    inspection_time: '',
    message: ''
  });

  const estateOptions = [
    'Bridgefort County',
    'Fortress Hills Estate',
    'Precious Gardens Estate (SOLD OUT)',
    'Royal Palm Estate',
    'Green Valley Estate',
    'Other'
  ];

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
  ];

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

    if (formData.estate_name.includes('SOLD OUT')) {
      toast({
        title: "Estate not available",
        description: "This estate is sold out. Please select another estate.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('inspection_bookings')
        .insert({
          user_id: user.id,
          estate_name: formData.estate_name,
          inspection_date: formData.inspection_date,
          inspection_time: formData.inspection_time,
          message: formData.message
        });

      if (error) throw error;

      toast({
        title: "Inspection booked successfully",
        description: "We will contact you to confirm your inspection appointment."
      });

      setFormData({
        estate_name: '',
        inspection_date: '',
        inspection_time: '',
        message: ''
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error booking inspection:', error);
      toast({
        title: "Booking failed",
        description: "Failed to book inspection. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-estate-blue hover:bg-estate-darkBlue">
          <Calendar className="mr-2 h-4 w-4" />
          Book Estate Inspection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Estate Inspection</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="estate_name">Estate to Inspect</Label>
            <Select value={formData.estate_name} onValueChange={(value) => setFormData(prev => ({ ...prev, estate_name: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select an estate" />
              </SelectTrigger>
              <SelectContent>
                {estateOptions.map((estate) => (
                  <SelectItem 
                    key={estate} 
                    value={estate}
                    disabled={estate.includes('SOLD OUT')}
                  >
                    {estate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="inspection_date">Preferred Date</Label>
            <Input
              id="inspection_date"
              type="date"
              value={formData.inspection_date}
              onChange={(e) => setFormData(prev => ({ ...prev, inspection_date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <Label htmlFor="inspection_time">Preferred Time</Label>
            <Select value={formData.inspection_time} onValueChange={(value) => setFormData(prev => ({ ...prev, inspection_time: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Any specific requirements or questions..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.estate_name || !formData.inspection_date || !formData.inspection_time}>
              {loading ? 'Booking...' : 'Book Inspection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InspectionBookingForm;
