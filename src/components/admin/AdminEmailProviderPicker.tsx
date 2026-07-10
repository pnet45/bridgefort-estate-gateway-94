import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';

type Provider = 'resend' | 'gmail';
const KEY = 'admin_email_provider';

const AdminEmailProviderPicker = () => {
  const [provider, setProvider] = useState<Provider>('resend');

  useEffect(() => {
    const saved = (localStorage.getItem(KEY) as Provider) || 'resend';
    setProvider(saved);
  }, []);

  const onChange = (v: Provider) => {
    setProvider(v);
    localStorage.setItem(KEY, v);
    toast.success(`Outgoing mail provider set to ${v === 'gmail' ? 'Gmail' : 'Resend'}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Mail className="h-4 w-4 text-muted-foreground" />
      <Label className="text-sm whitespace-nowrap">Send via</Label>
      <Select value={provider} onValueChange={(v) => onChange(v as Provider)}>
        <SelectTrigger className="w-36 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="resend">Resend</SelectItem>
          <SelectItem value="gmail">Gmail</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default AdminEmailProviderPicker;
