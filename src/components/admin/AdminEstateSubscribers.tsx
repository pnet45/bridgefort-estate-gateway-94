import React, { useEffect, useMemo, useState } from 'react';  
import { supabase } from '@/integrations/supabase/client';  
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';  
import { Input } from '@/components/ui/input';  
import { Button } from '@/components/ui/button';  
import { Badge } from '@/components/ui/badge';  
import {  
  Dialog,  
  DialogContent,  
  DialogDescription,  
  DialogHeader,  
  DialogTitle,  
} from '@/components/ui/dialog';  
import { Search, RefreshCw, Users, Eye, Loader2, CreditCard, FileText } from 'lucide-react';  
import { toast } from '@/hooks/use-toast';  

type Subscriber = {  
  subscription_number: string;  
  subscriber_name: string;  
  estate_name: string;  
  estate_code: string;  
  client_id: string | null;  
  order_id: string | null;  
  subscription_status: string;  
  payment_plan: string | null;  
  subscription_amount: number;  
  subscribed_at: string;  
  client_email: string | null;  
  plot_count: number;  
  order_total: number;  
  amount_paid: number;  
  outstanding_balance: number;  
};  

type History = {  
  payment_id: string;  
  payment_type: string;  
  amount: number;  
  reference: string | null;  
  status: string;  
  payment_date: string;  
  description: string | null;  
  installment_number: number | null;  
  installment_status: string | null;  
  installment_amount_paid: number | null;  
  installment_amount_due: number | null;  
  documentation_name: string | null;  
};  

const money = (value: number) => `₦${Number(value || 0).toLocaleString('en-NG')}`;  

const statusVariant = (s?: string): 'default' | 'secondary' => {  
  const normalized = String(s || '').toLowerCase();  
  return normalized === 'approved' || normalized === 'paid' ? 'default' : 'secondary';  
};  

const AdminEstateSubscribers: React.FC = () => {  
  const [rows, setRows] = useState<Subscriber[]>([]);  
  const [loading, setLoading] = useState(true);  
  const [query, setQuery] = useState('');  
  const [estate, setEstate] = useState('all');  
  const [selected, setSelected] = useState<Subscriber | null>(null);  
  const [history, setHistory] = useState<History[]>([]);  
  const [historyLoading, setHistoryLoading] = useState(false);  

  const load = async () => {  
    setLoading(true);  
    try {  
      const { data, error } = await supabase.rpc('admin_get_estate_subscribers', {  
        _search: query.trim() || null,  
        _estate_code: estate === 'all' ? null : estate,  
      });  
      if (error) throw error;  
      setRows((data || []) as Subscriber[]);  
    } catch (e: any) {  
      toast({  
        title: 'Could not load subscribers',  
        description: e?.message || 'Please try again.',  
        variant: 'destructive',  
      });  
    } finally {  
      setLoading(false);  
    }  
  };  

  const openSubscriber = async (r: Subscriber) => {  
    setSelected(r);  
    setHistory([]);  
    if (!r.order_id) return;  
    setHistoryLoading(true);  
    try {  
      const { data, error } = await supabase.rpc('admin_get_subscriber_history', {  
        _order_id: r.order_id,  
      });  
      if (error) throw error;  
      setHistory((data || []) as History[]);  
    } catch (e: any) {  
      toast({  
        title: 'Could not load subscriber history',  
        description: e?.message || 'Please try again.',  
        variant: 'destructive',  
      });  
    } finally {  
      setHistoryLoading(false);  
    }  
  };  

  useEffect(() => {  
    load();  
  }, [estate]); // eslint-disable-line react-hooks/exhaustive-deps  

  const estates = useMemo(  
    () => Array.from(new Map(rows.map((r) => [r.estate_code, r.estate_name])).entries()),  
    [rows]  
  );  

  return (  
    <Card className="border-slate-700 bg-slate-950 text-white shadow-xl dark:border-slate-700 dark:bg-slate-950 dark:text-white light:border-slate-200 light:bg-white light:text-slate-900">  
      <CardHeader className="border-b border-slate-700 bg-white/[0.03] dark:border-slate-700 dark:bg-white/[0.03] light:border-slate-200 light:bg-slate-50">  
        <div className="flex flex-wrap items-center justify-between gap-3">  
          <div>  
            <CardTitle className="flex items-center gap-2">  
              <Users className="h-5 w-5 text-primary" />  
              Estate Subscribers  
              <Badge className="bg-primary/20 text-primary">{rows.length}</Badge>  
            </CardTitle>  
            <p className="mt-1 text-sm text-slate-300 dark:text-slate-300 light:text-slate-600">  
              Search and review subscribers, plots, payments and outstanding balances.  
            </p>  
          </div>  
          <Button  
            variant="ghost"  
            size="icon"  
            onClick={load}  
            disabled={loading}  
            className="text-slate-300 hover:bg