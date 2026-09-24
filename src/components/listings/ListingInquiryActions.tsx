import { useState } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

type ActionType = 'call' | 'email' | 'whatsapp' | 'information_request';

interface Props {
  listingId: string;
  title: string;
  agentEmail?: string | null;
  agentPhone?: string | null;
}

const ListingInquiryActions = ({ listingId, title, agentEmail, agentPhone }: Props) => {
  const { user, profile } = useAuth();
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });

  const destinationFor = (action: ActionType) => {
    if (action === 'call') return agentPhone ? `tel:${agentPhone}` : null;
    if (action === 'email') return agentEmail ? `mailto:${agentEmail}?subject=${encodeURIComponent(`Property inquiry: ${title}`)}` : null;
    if (action === 'whatsapp') return agentPhone ? `https://wa.me/${agentPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in ${title}`)}` : null;
    return null;
  };

  const recordAndContinue = async (action: ActionType, guestContact = contact) => {
    setSubmitting(true);
    const body = {
      listingId,
      actionType: action,
      name: user ? [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || undefined : guestContact.name || undefined,
      email: user?.email || guestContact.email || undefined,
      phone: profile?.phone_number || guestContact.phone || undefined,
    };
    const { error } = await supabase.functions.invoke('capture-property-inquiry', { body });
    setSubmitting(false);
    if (error) {
      toast({ title: 'Could not record your inquiry', description: error.message, variant: 'destructive' });
      return;
    }
    setPendingAction(null);
    toast({ title: 'Inquiry recorded', description: 'A property adviser will follow up with you.' });
    const destination = destinationFor(action);
    if (destination) action === 'whatsapp' ? window.open(destination, '_blank', 'noopener,noreferrer') : window.location.assign(destination);
  };

  const startAction = (action: ActionType) => {
    if (user) void recordAndContinue(action);
    else setPendingAction(action);
  };

  return (
    <>
      {agentPhone && <Button className="w-full" size="lg" onClick={() => startAction('call')}><Phone className="mr-2 h-4 w-4" />Call Agent</Button>}
      {agentEmail && <Button variant="outline" className="w-full" size="lg" onClick={() => startAction('email')}><Mail className="mr-2 h-4 w-4" />Email Agent</Button>}
      {agentPhone && <Button variant="secondary" className="w-full" size="lg" onClick={() => startAction('whatsapp')}><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</Button>}
      <Button variant="outline" className="w-full" size="lg" onClick={() => startAction('information_request')}>Request Information</Button>

      <Dialog open={Boolean(pendingAction)} onOpenChange={(open) => !open && setPendingAction(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>How can we contact you?</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label htmlFor="inquiry-name">Name</Label><Input id="inquiry-name" value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))} /></div>
            <div><Label htmlFor="inquiry-email">Email</Label><Input id="inquiry-email" type="email" value={contact.email} onChange={(event) => setContact((current) => ({ ...current, email: event.target.value }))} /></div>
            <div><Label htmlFor="inquiry-phone">Phone</Label><Input id="inquiry-phone" value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))} /></div>
            <Button className="w-full" disabled={submitting || (!contact.email && !contact.phone)} onClick={() => pendingAction && void recordAndContinue(pendingAction)}>{submitting ? 'Sending…' : 'Continue'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ListingInquiryActions;