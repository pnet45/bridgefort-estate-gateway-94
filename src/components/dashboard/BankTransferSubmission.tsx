import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BankTransferSubmission() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [amounts, setAmounts] = useState<Record<string,string>>({});
  const [refs, setRefs] = useState<Record<string,string>>({});
  const [files, setFiles] = useState<Record<string,File|null>>({});
  const [busy, setBusy] = useState<string|null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => { if (!user) return; supabase.from('orders').select('id,total_amount,amount_paid,payment_status').eq('user_id',user.id).order('created_at',{ascending:false}).limit(50).then(({data,error}) => { if(error) { console.warn('Order list unavailable for transfer submission',error); return; } setOrders((data||[]).filter((o:any)=>Number(o.total_amount||0)>Number(o.amount_paid||0)&&!['rejected','cancelled'].includes(String(o.payment_status||'').toLowerCase()))); }); },[user]);
  const submit = async (order:any) => {
    if(!user) return;
    const amount=Number(amounts[order.id]||0), ref=refs[order.id]?.trim()||'', file=files[order.id], balance=Math.max(0,Number(order.total_amount||0)-Number(order.amount_paid||0));
    if(!Number.isFinite(amount)||amount<=0||amount>balance+0.01){setMessage('Enter a valid amount not exceeding the outstanding balance.');return;}
    if(ref.length<4||!file){setMessage('Enter the transfer reference and attach proof.');return;}
    if(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)||file.size>5*1024*1024){setMessage('Proof must be JPG, PNG, WEBP or PDF, up to 5 MB.');return;}
    setBusy(order.id);setMessage('');
    try { const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_').slice(-100); const path=user.id+'/'+order.id+'/'+Date.now()+'-'+safe;
      const {error:upErr}=await supabase.storage.from('bank-transfer-proofs').upload(path,file,{contentType:file.type,upsert:false}); if(upErr) throw upErr;
      const {error:rpcErr}=await supabase.rpc('submit_bank_transfer_request',{_order_id:order.id,_amount:amount,_transfer_reference:ref,_proof_storage_path:path});
      if(rpcErr){await supabase.storage.from('bank-transfer-proofs').remove([path]);throw rpcErr;}
      setMessage('Transfer submitted and pending verification. It will not be marked paid until authorised staff confirm the funds reached Bridgefort’s company account.');setAmounts(v=>({...v,[order.id]:''}));setRefs(v=>({...v,[order.id]:''}));setFiles(v=>({...v,[order.id]:null}));
    } catch(e:any){setMessage(e?.message||'Transfer submission failed. Please try again.');} finally{setBusy(null);}
  };
  if(!user||orders.length===0) return null;
  return <section className='space-y-3 rounded-xl border p-4'><h3 className='font-semibold'>Report a Bank Transfer</h3><p className='text-sm text-muted-foreground'>Upload the transfer proof and reference for an outstanding order. Submission is not payment confirmation.</p>{message&&<p role='status' className='rounded border p-3 text-sm'>{message}</p>}{orders.map(order=>{const balance=Math.max(0,Number(order.total_amount||0)-Number(order.amount_paid||0));return <div key={order.id} className='space-y-3 rounded-lg border p-3'><p className='text-sm font-medium'>Order {String(order.id).slice(0,8)} · Balance ₦{balance.toLocaleString()}</p><div className='grid gap-3 md:grid-cols-3'><Input type='number' min='1' max={balance} step='0.01' value={amounts[order.id]||''} onChange={e=>setAmounts(v=>({...v,[order.id]:e.target.value}))} placeholder='Transfer amount (₦)' aria-label='Transfer amount'/><Input value={refs[order.id]||''} onChange={e=>setRefs(v=>({...v,[order.id]:e.target.value}))} placeholder='Bank transfer reference' maxLength={120} aria-label='Bank transfer reference'/><Input type='file' accept='image/jpeg,image/png,image/webp,application/pdf' onChange={e=>setFiles(v=>({...v,[order.id]:e.target.files?.[0]||null}))} aria-label='Transfer proof'/></div><Button type='button' onClick={()=>submit(order)} disabled={busy===order.id}>{busy===order.id?'Submitting…':'Submit for verification'}</Button></div>;})}</section>;
}
