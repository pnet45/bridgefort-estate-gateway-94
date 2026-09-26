import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, corsJson } from "../_shared/cors.ts";
const accounts=(v:string|null|undefined)=>(v||"").split(/[,;\n]+/).map(x=>x.trim().toLowerCase()).filter(Boolean);
Deno.serve(async(req)=>{
 const cors=corsHeaders(req);
 if(req.method==='OPTIONS') return new Response(null,{status:204,headers:cors});
 try{
  const auth=req.headers.get('Authorization'); if(!auth?.startsWith('Bearer ')) return corsJson(req,{error:'Unauthorized'},401);
  const url=Deno.env.get('SUPABASE_URL')!, anon=Deno.env.get('SUPABASE_ANON_KEY')!, service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}}}); const token=auth.slice(7); const {data:u,error:ue}=await userClient.auth.getUser(token); if(ue||!u?.user) return corsJson(req,{error:'Unauthorized'},401);
  const svc=createClient(url,service); const body=await req.json().catch(()=>({})); const mailboxEmail=String(body?.mailboxEmail||'').trim().toLowerCase(); if(!mailboxEmail) return corsJson(req,{error:'mailboxEmail is required'},400);
  const {data:access,error:ae}=await svc.rpc('user_mailbox_access',{_user_id:u.user.id,_mailbox_email:mailboxEmail,_provider:'gmail'}); if(ae||!access) return corsJson(req,{error:'Forbidden: mailbox access denied'},403);
  const {data:mb,error:me}=await svc.from('admin_mailboxes').select('provider_account_id').eq('mailbox_email',mailboxEmail).eq('mailbox_provider','gmail').eq('status','active'); if(me) throw me;
  const assigned=[...new Set((mb||[]).flatMap((x:any)=>accounts(x.provider_account_id)))];
  const {data:tokens,error:te}=await svc.from('gmail_oauth_tokens').select('id,google_account_email,is_active,created_at,updated_at').eq('email',mailboxEmail).eq('is_active',true).order('updated_at',{ascending:false}); if(te) throw te;
  const connections=(tokens||[]).filter((t:any)=>assigned.includes(String(t.google_account_email||'').toLowerCase())).map((t:any)=>({id:t.id,google_account_email:t.google_account_email,is_active:t.is_active,created_at:t.created_at,updated_at:t.updated_at}));
  return corsJson(req,{success:true,mailboxEmail,connections});
 }catch(e:any){return corsJson(req,{success:false,error:e?.message||'Unable to load Gmail connections'},e?.status||500)}
});
