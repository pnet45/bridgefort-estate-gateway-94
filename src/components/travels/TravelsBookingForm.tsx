import React, { useState } from 'react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your full name').max(100),
  email: z.string().trim().email('Enter a valid email').max(255),
  phone: z.string().trim().min(7, 'Enter a valid phone number').max(20),
  departure: z.string().min(1, 'Select a departure date'),
  return: z.string().min(1, 'Select a return date'),
  travelers: z.coerce.number().int().min(1, 'At least 1 traveler').max(50),
  package: z.string().min(1, 'Choose a package'),
  destination: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
});

interface Props {
  initialPackage?: string;
  initialDestination?: string;
}

const TravelsBookingForm: React.FC<Props> = ({ initialPackage = '', initialDestination = '' }) => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    departure: '', return: '',
    travelers: '1',
    package: initialPackage,
    destination: initialDestination,
    notes: '',
  });

  React.useEffect(() => {
    setForm((f) => ({
      ...f,
      package: initialPackage || f.package,
      destination: initialDestination || f.destination,
    }));
  }, [initialPackage, initialDestination]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      toast({ title: 'Please fix the highlighted fields', variant: 'destructive' });
      return;
    }
    if (new Date(result.data.return) < new Date(result.data.departure)) {
      setErrors({ return: 'Return date must be after departure' });
      return;
    }
    setErrors({});
    // Frontend-only handoff: in production wire to an edge function / Resend
    setSubmitted(true);
    toast({
      title: 'Enquiry received ✈️',
      description: "Our travel consultant will contact you within 24 hours.",
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <section id="booking" className="section-padding bg-gradient-to-br from-muted/40 to-background">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Book or Enquire</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tell us about your trip — our consultants reply within 24 hours.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-card border rounded-2xl shadow-xl p-6 md:p-10"
        >
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto rounded-full bg-estate-blue/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="text-estate-blue" size={32} />
              </div>
              <h3 className="font-display text-2xl font-bold mb-2">Thank you, {form.name.split(' ')[0]}!</h3>
              <p className="text-muted-foreground mb-6">
                Your enquiry has been received. A Bridgefort travel consultant will contact you at <strong>{form.email}</strong> within 24 hours.
              </p>
              <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ ...form, notes: '' }); }}>
                Submit another enquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={100} className="mt-1.5 h-11" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} maxLength={255} className="mt-1.5 h-11" />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} maxLength={20} placeholder="+234…" className="mt-1.5 h-11" />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="destination">Preferred destination</Label>
                <Input id="destination" value={form.destination} onChange={(e) => set('destination', e.target.value)} maxLength={120} placeholder="e.g. Dubai" className="mt-1.5 h-11" />
              </div>

              <div>
                <Label htmlFor="departure">Departure date *</Label>
                <Input id="departure" type="date" min={today} value={form.departure} onChange={(e) => set('departure', e.target.value)} className="mt-1.5 h-11" />
                {errors.departure && <p className="text-xs text-destructive mt-1">{errors.departure}</p>}
              </div>

              <div>
                <Label htmlFor="return">Return date *</Label>
                <Input id="return" type="date" min={form.departure || today} value={form.return} onChange={(e) => set('return', e.target.value)} className="mt-1.5 h-11" />
                {errors.return && <p className="text-xs text-destructive mt-1">{errors.return}</p>}
              </div>

              <div>
                <Label htmlFor="travelers">Number of travelers *</Label>
                <Input id="travelers" type="number" min={1} max={50} value={form.travelers} onChange={(e) => set('travelers', e.target.value)} className="mt-1.5 h-11" />
                {errors.travelers && <p className="text-xs text-destructive mt-1">{errors.travelers}</p>}
              </div>

              <div>
                <Label>Preferred package *</Label>
                <Select value={form.package} onValueChange={(v) => set('package', v)}>
                  <SelectTrigger className="mt-1.5 h-11">
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Explorer">Explorer — from ₦650,000</SelectItem>
                    <SelectItem value="Premium">Premium — from ₦1,450,000</SelectItem>
                    <SelectItem value="Luxury">Luxury — from ₦3,200,000</SelectItem>
                    <SelectItem value="Custom">Custom / Bespoke</SelectItem>
                    <SelectItem value="Visa Only">Visa assistance only</SelectItem>
                    <SelectItem value="Flight Only">Flight booking only</SelectItem>
                  </SelectContent>
                </Select>
                {errors.package && <p className="text-xs text-destructive mt-1">{errors.package}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Additional notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Special requirements, preferred airline, hotel preferences…"
                  className="mt-1.5"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="cta" size="lg" className="gap-2">
                  <Send size={18} /> Submit Enquiry
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TravelsBookingForm;
