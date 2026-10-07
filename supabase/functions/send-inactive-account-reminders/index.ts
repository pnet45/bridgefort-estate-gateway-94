import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const resend=new Resend(Deno.env.get("RESEND_API_KEY")!);
const FROM="Bridgefort Homes Development Ltd. <info@bridgeforthomes.com>";
const WEBSITE="https://www.bridgeforthomes.com";
const LOGIN="https://www.bridgeforthomes.com/login";
const json=(v:unknown,s=200)=>new Response(JSON.stringify(v),{status:s,headers:{"Content-Type":"application/json"}});
const esc=(v:unknown)=>String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");
const lagos=()=>{const p=new Intl.DateTimeFormat("en-GB",{timeZone:"Africa/Lagos",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false}).formatToParts(new Date());const g=(x:string)=>Number(p.find(a=>a.type===x)?.value||0);return{year:g("year"),month:g("month"),day:g("day"),hour:g("hour"),minute:g("minute")}};
const today=()=>{const x=lagos();return `${x.year}-${String(x.month).padStart(2,"0")}-${String(x.day).padStart(2,"0")}`};
const formatDate=(v:any)=>new Intl.DateTimeFormat("en-NG",{dateStyle:"long",timeZone:"Africa/Lagos"}).format(new Date(v));
function replace(s:string,vars:Record<string,string>){let o=s||"";for(const[k,v]of Object.entries(vars))o=o.replace(new RegExp(`\\{\\{${k}\\}\\}`,"g"),esc(v));return o.replace(/\\n/g,"<br/>")}
function branded(body:string,pre:string){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>@media(max-width:680px){.shell{width:100%!important}.content{padding:25px 18px!important}}</style></head><body style="margin:0;background:#F4F0FA;font-family:Arial,Helvetica,sans-serif;color:#25212B"><div style="display:none">${esc(pre)}</div><table width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 12px"><table class="shell" width="100%" style="max-width:680px;background:#fff;border-radius:18px;overflow:hidden"><tr><td style="background:#5B2A86;padding:30px;text-align:center;color:#fff"><div style="font-size:27px;font-weight:800">Bridgefort Homes</div><div style="font-size:13px;color:#EADCF6;margin-top:7px">Development Ltd.</div><div style="display:inline-block;margin-top:18px;padding:7px 14px;border:1px solid #CAA8E8;border-radius:30px;font-size:12px;font-weight:700">BRINGING YOUR DREAM HOME</div></td></tr><tr><td class="content" style="padding:34px 30px;font-size:16px;line-height:1.75">${body}</td></tr><tr><td style="background:#3B2057;padding:26px;text-align:center;color:#fff;font-size:12px;line-height:1.8"><strong style="font-size:16px">Bridgefort Homes Development Ltd.</strong><br><span style="color:#E9DDF3">Bringing your dream home!</span><br><a style="color:#fff" href="${WEBSITE}">www.bridgeforthomes.com</a><br>info@bridgeforthomes.com | sales@bridgeforthomes.com<br>+234 803 062 4059 | +234 807 071 0688</td></tr></table></td></tr></table></body></html>`}
async function authorized(req:Request){const t=req.headers.get("x-bridgefort-cron-token")?.trim();if(!t)return false;const{data,error}=await supabase.from("automation_secrets").select("secret_hash").eq("secret_name","inactive_account_reminders").eq("is_active",true).maybeSingle();if(error||!data)return false;const h=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));const hex=Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,"0")).join("");return hex===data.secret_hash}
function scheduled(c:any,n:any){const[h,m]=String(c.schedule_time||"08:00").slice(0,5).split(":").map(Number);return n.hour===h&&Math.abs(n.minute-m)<=7}
function ranToday(c:any){return !!c.last_run_at&&new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Lagos"}).format(new Date(c.last_run_at))===today()}
async function excludedIds(){const{data,error}=await supabase.from("user_roles").select("user_id").in("role",["admin","super_admin","team_leader"]);if(error)throw error;return new Set((data||[]).map((x:any)=>x.user_id))}
async function emails(){const{data,error}=await supabase.auth.admin.listUsers({page:1,perPage:1000});if(error)throw error;return new Map((data?.users||[]).map((u:any)=>[u.id,u]))}
async function record(c:any,count:number,status:string){await supabase.from("crm_automation_campaigns").update({last_run_at:new Date().toISOString(),last_run_status:status,last_run_count:count,updated_at:new Date().toISOString()}).eq("id",c.id)}
async function send(c:any,u:any,name:string,vars:Record<string,string>){
  const preferenceCategory = c.campaign_key === "birthday"
    ? "marketing"
    : c.campaign_key === "allocation_update"
      ? "property_updates"
      : c.campaign_key === "payment_reminder"
        ? null
        : "account_updates";
  if (preferenceCategory) {
    const { data: allowed, error: preferenceError } = await supabase.rpc("email_preference_enabled", {
      p_user_id: u.id,
      p_category: preferenceCategory,
    });
    if (preferenceError) throw preferenceError;
    if (allowed === false) return { ok: true, skipped: true, preferenceCategory };
  }
  const subject=replace(c.subject,vars);
  const body=replace(c.body,vars);
  const html=branded(`<p>Dear <strong>${esc(name)}</strong>,</p><p>${body}</p><p>Warm regards,<br><strong>Bridgefort Homes Family</strong></p>`,subject);
  const text=(c.body||"").replace(/\\\\n/g,"\\n").replace(/\\{\\{name\\}\\}/g,name);
  const eventKey=[c.campaign_key,u.id,today(),vars.status||vars.property_name||""].join(":");
  const now=new Date().toISOString();
  const {data:existing,error:existingError}=await supabase.from("email_delivery_events").select("id,status,attempt_count").eq("event_key",eventKey).maybeSingle();
  if(existingError) throw existingError;
  if(existing?.status==="sent") return {ok:true,duplicate:true,id:null};
  const attempt=(existing?.attempt_count||0)+1;
  const {error:queueError}=await supabase.from("email_delivery_events").upsert({
    event_key:eventKey,recipient_email:u.email,recipient_user_id:u.id,recipient_name:name,subject,
    provider:"resend",sender_email:"info@bridgeforthomes.com",sender_name:"Bridgefort Homes Development Ltd.",
    template_key:c.campaign_key,source_function:"send-inactive-account-reminders",source_reference:eventKey,
    status:"queued",attempt_count:attempt,metadata:vars,retryable:true,payload:{from:FROM,to:[u.email],subject,html,text},queued_at:now,updated_at:now
  },{onConflict:"event_key"});
  if(queueError) throw queueError;
  const r=await resend.emails.send({from:FROM,to:[u.email],subject,html,text});
  const ok=!r.error;
  const providerId=(r.data as any)?.id||null;
  await supabase.from("email_delivery_events").update({
    status:ok?"sent":"failed",provider_message_id:providerId,error_message:r.error?.message||null,
    sent_at:ok?now:null,updated_at:new Date().toISOString()
  }).eq("event_key",eventKey);
  await supabase.from("email_logs").insert({recipient_email:u.email,recipient_name:name,subject,body:text,status:ok?"sent":"failed",sent_at:ok?now:null,created_at:now});
  return{ok,error:r.error?.message,id:providerId};
}
async function birthday(c:any){const n=lagos(),excluded=await excludedIds(),users=await emails();const{data:p,error}=await supabase.from("profiles").select("id,first_name,date_of_birth,is_active,birthday_reminder_sent_year").not("date_of_birth","is",null);if(error)throw error;let sent=0,failed=0;for(const x of p||[]){if(!x.id||excluded.has(x.id)||x.is_active===false||Number(x.birthday_reminder_sent_year)===n.year)continue;const d=String(x.date_of_birth).slice(5,10);if(d!==`${String(n.month).padStart(2,"0")}-${String(n.day).padStart(2,"0")}`)continue;const u=users.get(x.id);if(!u?.email||!u.email_confirmed_at||u.deleted_at)continue;const name=x.first_name||"Valued Client";const r=await send(c,u,name,{name,email:u.email,date:today(),login_url:LOGIN,website:WEBSITE});if(r.ok){sent++;await supabase.from("profiles").update({birthday_reminder_sent_year:n.year,updated_at:new Date().toISOString()}).eq("id",x.id)}else failed++}await record(c,sent,failed?"completed_with_errors":"completed");return{campaign:c.campaign_key,sent,failed}}
async function profileCompletion(c:any){const excluded=await excludedIds(),users=await emails();const threshold=Number(c.threshold_value)||80;const{data:p,error}=await supabase.from("profiles").select("id,first_name,profile_completion_percentage,is_active").lt("profile_completion_percentage",threshold).eq("is_active",true);if(error)throw error;let sent=0,failed=0;for(const x of p||[]){if(excluded.has(x.id))continue;const u=users.get(x.id);if(!u?.email||!u.email_confirmed_at||u.deleted_at)continue;const r=await send(c,u,x.first_name||"Valued Client",{name:x.first_name||"Valued Client",email:u.email,date:today(),login_url:LOGIN,website:WEBSITE,completion_percentage:String(x.profile_completion_percentage??0)});if(r.ok)sent++;else failed++}await record(c,sent,failed?"completed_with_errors":"completed");return{campaign:c.campaign_key,sent,failed,threshold}}
async function paymentReminder(c:any){const excluded=await excludedIds(),users=await emails();const cooldown=Number(c.cooldown_days)||7;const since=new Date(Date.now()-cooldown*86400000).toISOString();const{data:logs,error:le}=await supabase.from("email_logs").select("recipient_email,created_at,subject").gte("created_at",since).ilike("subject","%payment%");if(le)throw le;const recent=new Set((logs||[]).map((x:any)=>x.recipient_email));const{data:p,error}=await supabase.from("payments").select("user_id,property_id,total_amount,amount_paid,balance,status,reference").gt("balance",0);if(error)throw error;const{data:mp,error:me}=await supabase.from("my_properties").select("user_id,property_name,plot_id,balance").gt("balance",0);if(me)throw me;const prop=new Map((mp||[]).map((x:any)=>[x.user_id,x]));let sent=0,failed=0;for(const x of p||[]){if(!x.user_id||excluded.has(x.user_id)||Number(x.balance)<=0)continue;const u=users.get(x.user_id);if(!u?.email||!u.email_confirmed_at||u.deleted_at||recent.has(u.email))continue;const q=prop.get(x.user_id);const r=await send(c,u,u.user_metadata?.first_name||"Valued Client",{name:u.user_metadata?.first_name||"Valued Client",email:u.email,date:today(),login_url:LOGIN,website:WEBSITE,balance:`₦${Number(x.balance).toLocaleString("en-NG")}`,amount_due:`₦${Number(x.balance).toLocaleString("en-NG")}`,property_name:q?.property_name||"Your Bridgefort property",plot_id:q?.plot_id||x.property_id||""});if(r.ok)sent++;else failed++}await record(c,sent,failed?"completed_with_errors":"completed");return{campaign:c.campaign_key,sent,failed}}
async function renewal(c:any){const excluded=await excludedIds(),users=await emails(),days=Number(c.threshold_value)||30;const limit=new Date(Date.now()+days*86400000).toISOString();const{data:p,error}=await supabase.from("profiles").select("id,first_name,registration_expires_at,renewal_reminder_sent_at,is_active").not("registration_expires_at","is",null).eq("is_active",true).lte("registration_expires_at",limit).gte("registration_expires_at",new Date().toISOString());if(error)throw error;let sent=0,failed=0;for(const x of p||[]){if(excluded.has(x.id))continue;const u=users.get(x.id);if(!u?.email||!u.email_confirmed_at||u.deleted_at)continue;if(x.renewal_reminder_sent_at&&new Date(x.renewal_reminder_sent_at)>new Date(Date.now()-Math.max(1,Number(c.cooldown_days)||7)*86400000))continue;const r=await send(c,u,x.first_name||"Valued Client",{name:x.first_name||"Valued Client",email:u.email,date:today(),login_url:LOGIN,website:WEBSITE,expiry_date:formatDate(x.registration_expires_at)});if(r.ok){sent++;await supabase.from("profiles").update({renewal_reminder_sent_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",x.id)}else failed++}await record(c,sent,failed?"completed_with_errors":"completed");return{campaign:c.campaign_key,sent,failed,days}}
async function allocationUpdate(c:any){
  const excluded=await excludedIds(),users=await emails();
  const{data:p,error:pe}=await supabase.from("profiles").select("id,first_name,is_active").eq("is_active",true);
  if(pe)throw pe;
  const{data:a,error:ae}=await supabase.from("client_allocations").select("id,user_id,estate_name_snapshot,location_snapshot,plot_id,plot_label,allocation_status,allocation_date,possession_date,allocation_letter_url,notes,last_notified_status,last_notified_at").in("allocation_status",["allocated","possession_ready","possessed","cancelled"]).order("updated_at",{ascending:true});
  if(ae)throw ae;
  let sent=0,failed=0,skipped=0;
  for(const x of a||[]){
    if(!x.user_id||excluded.has(x.user_id)||x.last_notified_status===x.allocation_status){skipped++;continue}
    const u=users.get(x.user_id);
    if(!u?.email||!u.email_confirmed_at||u.deleted_at){skipped++;continue}
    const profile=p?.find((z:any)=>z.id===x.user_id);
    if(!profile||profile.is_active===false){skipped++;continue}
    const name=profile.first_name||u.user_metadata?.first_name||"Valued Client";
    const statusLabel=String(x.allocation_status||"").replace(/_/g," ").replace(/\b\w/g,(m:string)=>m.toUpperCase());
    const r=await send(c,u,name,{name,email:u.email,date:today(),login_url:LOGIN,website:WEBSITE,estate_name:x.estate_name_snapshot||"Your Bridgefort property",plot_id:x.plot_id||x.plot_label||"Not specified",status:statusLabel,allocation_date:x.allocation_date?formatDate(x.allocation_date):"Not recorded",possession_date:x.possession_date?formatDate(x.possession_date):"Not yet scheduled",notes:x.notes||"Please contact our Client Service Team.",allocation_letter_url:x.allocation_letter_url||""});
    if(r.ok){sent++;await supabase.from("client_allocations").update({last_notified_status:x.allocation_status,last_notified_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",x.id)}else failed++;
  }
  await record(c,sent,failed?"completed_with_errors":"completed");
  return{campaign:c.campaign_key,sent,failed,skipped};
}
async function inactive(c:any){const cutoff=new Date();cutoff.setMonth(cutoff.getMonth()-(Number(c.threshold_value)||12));const excluded=await excludedIds(),users=await emails();const{data:p,error}=await supabase.from("profiles").select("id,first_name,is_active").eq("is_active",true);if(error)throw error;const sentRows=(await supabase.from("inactive_account_reminders").select("user_id,last_sent_at")).data||[];const sm=new Map(sentRows.map((x:any)=>[x.user_id,x]));let sent=0,failed=0;for(const u of users.values()){if(!u.id||!u.email||!u.email_confirmed_at||u.deleted_at||excluded.has(u.id)||!u.last_sign_in_at||new Date(u.last_sign_in_at)>cutoff||u.banned_until&&new Date(u.banned_until)>new Date())continue;const profile=p?.find((x:any)=>x.id===u.id);if(!profile||profile.is_active===false)continue;const old=sm.get(u.id);if(old?.last_sent_at&&new Date(old.last_sent_at)>new Date(Date.now()-(Number(c.cooldown_days)||365)*86400000))continue;const name=profile.first_name||u.user_metadata?.first_name||"Valued Client";const r=await send(c,u,name,{name,email:u.email,date:today(),last_login_date:formatDate(u.last_sign_in_at),login_url:LOGIN,website:WEBSITE});if(r.ok){sent++;await supabase.from("inactive_account_reminders").upsert({user_id:u.id,email:u.email,last_login_at:u.last_sign_in_at,last_sent_at:new Date().toISOString(),status:"sent",resend_id:r.id,error_message:null,updated_at:new Date().toISOString()},{onConflict:"user_id"})}else failed++}await record(c,sent,failed?"completed_with_errors":"completed");return{campaign:c.campaign_key,sent,failed}}
Deno.serve(async req=>{if(req.method!=="POST")return json({error:"Method not allowed"},405);try{if(!(await authorized(req)))return json({error:"Unauthorized"},401);const n=lagos();const{data:cs,error}=await supabase.from("crm_automation_campaigns").select("*").eq("enabled",true);if(error)throw error;const results:any[]=[];for(const c of cs||[]){if(!scheduled(c,n)||ranToday(c))continue;if(c.campaign_key==="birthday")results.push(await birthday(c));else if(c.campaign_key==="profile_completion")results.push(await profileCompletion(c));else if(c.campaign_key==="payment_reminder")results.push(await paymentReminder(c));else if(c.campaign_key==="subscription_renewal")results.push(await renewal(c));else if(c.campaign_key==="inactive_account_12m")results.push(await inactive(c));else if(c.campaign_key==="allocation_update")results.push(await allocationUpdate(c));else results.push({campaign:c.campaign_key,status:"blocked_not_connected_to_verified_business_data"});}return json({success:true,results,checked_at:new Date().toISOString(),lagos_time:n})}catch(e:any){console.error(e);return json({success:false,error:e?.message||"Unexpected error"},500)}});