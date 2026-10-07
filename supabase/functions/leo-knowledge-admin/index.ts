import { createClient } from "npm:@supabase/supabase-js@2.110.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const Schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list") }),
  z.object({ action: z.literal("get"), id: z.string().uuid() }),
  z.object({ action: z.literal("history"), id: z.string().uuid() }),
  z.object({ action: z.literal("source_sync_list") }),
  z.object({ action: z.literal("source_sync_get"), id: z.string().uuid() }),
  z.object({ action: z.literal("source_sync_approve"), id: z.string().uuid() }),
  z.object({ action: z.literal("source_sync_reject"), id: z.string().uuid() }),
  z.object({ action: z.literal("source_sync_mark_reviewed"), id: z.string().uuid() }),
  z.object({
    action: z.literal("upsert"),
    id: z.string().uuid().optional(),
    title: z.string().trim().min(1).max(180),
    sourceUrl: z.string().trim().max(500).nullable().optional(),
    audience: z.enum(["public","staff","restricted"]),
    allowedRoles: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
    topics: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
    status: z.enum(["draft","published","archived"]).default("published"),
    content: z.string().trim().min(1).max(120000),
  }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }),
]);

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,"Content-Type":"application/json"}});

const chunkText=(value:string,size=2200)=>{
  const out:{heading:string;content:string}[]=[]; let buffer=""; let heading="";
  for(const line of value.replace(/\\r/g,"").split("\n")){
    const match=line.match(/^#{1,4}\\s+(.+)/); if(match) heading=match[1].trim();
    const candidate=buffer?buffer+"\n"+line:line;
    if(candidate.length>size&&buffer){out.push({heading,content:buffer.trim()});buffer=line;} else buffer=candidate;
  }
  if(buffer.trim()) out.push({heading,content:buffer.trim()});
  return out.slice(0,80);
};

Deno.serve(async(req)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST") return json({error:"Method not allowed"},405);
  try{
    const body=Schema.safeParse(await req.json());
    if(!body.success) return json({error:"Invalid knowledge-base request"},400);
    const url=Deno.env.get("SUPABASE_URL"), anon=Deno.env.get("SUPABASE_ANON_KEY"), serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if(!url||!anon||!serviceKey) return json({error:"Knowledge base is not configured"},500);
    const auth=req.headers.get("Authorization");
    if(!auth?.startsWith("Bearer ")) return json({error:"Authentication required"},401);
    const token=auth.slice(7).trim();
    const userClient=createClient(url,anon,{global:{headers:{Authorization:`Bearer ${token}`}}});
    const {data:{user},error:authError}=await userClient.auth.getUser(token);
    if(authError||!user) return json({error:"Authentication required"},401);
    const service=createClient(url,serviceKey);
    const {data:canView,error:permissionError}=await service.rpc("user_has_permission",{_user_id:user.id,_permission_key:"admin:view_content"});
    if(permissionError) throw permissionError;
    if(!canView) return json({error:"Content-management permission is required"},403);

    if(body.data.action==="list"){
      const {data,error}=await service.from("leo_knowledge_documents").select("id,title,source_url,audience,allowed_roles,topics,status,version,updated_at,created_at").order("updated_at",{ascending:false}).limit(200);
      if(error) throw error;
      return json({documents:data??[]});
    }

    if(body.data.action==="get"){
      const {data,error}=await service.from("leo_knowledge_documents").select("*").eq("id",body.data.id).single();
      if(error) throw error;
      return json({document:data});
    }

    if(body.data.action==="history"){
      const {data,error}=await service.from("leo_knowledge_versions")
        .select("id,document_id,version,title,content,audience,allowed_roles,topics,status,change_type,change_summary,changed_by,created_at")
        .eq("document_id",body.data.id)
        .order("version",{ascending:false})
        .limit(100);
      if(error) throw error;
      return json({versions:data??[]});
    }

    if(body.data.action==="source_sync_list"){
      const {data,error}=await service.from("leo_knowledge_source_sync")
        .select("*,document:leo_knowledge_documents(id,title,version,status,audience,updated_at)")
        .order("updated_at",{ascending:false});
      if(error) throw error;
      return json({sources:data??[]});
    }

    if(body.data.action==="source_sync_get"){
      const {data,error}=await service.from("leo_knowledge_source_sync")
        .select("*,document:leo_knowledge_documents(*)")
        .eq("id",body.data.id).single();
      if(error) throw error;
      return json({source:data});
    }

    if(body.data.action==="source_sync_mark_reviewed"){
      const {data:sync,error:syncError}=await service.from("leo_knowledge_source_sync").select("*").eq("id",body.data.id).single();
      if(syncError) throw syncError;
      if(!sync.pending_hash) return json({error:"There is no pending source change to mark as reviewed"},409);
      const {data:source,error:sourceError}=await service.from("leo_knowledge_source_sync")
        .update({
          source_hash:sync.pending_hash,
          pending_hash:null,
          pending_content:null,
          pending_title:null,
          pending_detected_at:null,
          status:"clean",
          last_error:null,
          updated_at:new Date().toISOString(),
        })
        .eq("id",sync.id)
        .select("id,source_url,status,source_hash,last_checked_at").single();
      if(sourceError) throw sourceError;
      return json({reviewed:true,source});
    }

    if(body.data.action==="source_sync_reject"){
      const {data,error}=await service.from("leo_knowledge_source_sync")
        .update({source_hash:sync.pending_hash,pending_hash:null,pending_content:null,pending_title:null,pending_detected_at:null,status:"clean",last_error:null,updated_at:new Date().toISOString()})
        .eq("id",body.data.id)
        .select("id,source_url,status,last_checked_at").single();
      if(error) throw error;
      return json({rejected:true,source:data});
    }

    if(body.data.action==="source_sync_approve"){
      const {data:sync,error:syncError}=await service.from("leo_knowledge_source_sync").select("*").eq("id",body.data.id).single();
      if(syncError) throw syncError;
      if(!sync.pending_hash||!sync.pending_content) return json({error:"There is no pending source version to approve"},409);

      const {data:doc,error:docError}=await service.from("leo_knowledge_documents").select("*").eq("id",sync.document_id).single();
      if(docError) throw docError;

      const {error:updateError}=await service.from("leo_knowledge_documents").update({
        content:sync.pending_content,
        updated_by:user.id,
        updated_at:new Date().toISOString(),
        status:doc.status==="archived"?"archived":"published",
      }).eq("id",doc.id);
      if(updateError) throw updateError;

      const chunks=chunkText(sync.pending_content);
      await service.from("leo_knowledge_chunks").delete().eq("document_id",doc.id);
      if(chunks.length){
        const {error:chunkError}=await service.from("leo_knowledge_chunks").insert(chunks.map((c,i)=>({document_id:doc.id,chunk_index:i,heading:c.heading||doc.title,content:c.content})));
        if(chunkError) throw chunkError;
      }

      const {data:source,error:sourceError}=await service.from("leo_knowledge_source_sync")
        .update({
          source_hash:sync.pending_hash,
          pending_hash:null,
          pending_content:null,
          pending_title:null,
          pending_detected_at:null,
          status:"clean",
          last_error:null,
          updated_at:new Date().toISOString(),
        })
        .eq("id",sync.id)
        .select("id,source_url,status,source_hash,last_checked_at").single();
      if(sourceError) throw sourceError;

      const {data:updatedDoc}=await service.from("leo_knowledge_documents").select("id,title,version,status,updated_at").eq("id",doc.id).single();
      return json({approved:true,source,document:updatedDoc,chunkCount:chunks.length});
    }

    if(body.data.action==="delete"){
      const {error}=await service.from("leo_knowledge_documents").delete().eq("id",body.data.id);
      if(error) throw error;
      return json({deleted:true});
    }

    const chunks=chunkText(body.data.content);
    let documentId=body.data.id??null;
    const payload={
      title:body.data.title,
      source_url:body.data.sourceUrl||null,
      audience:body.data.audience,
      allowed_roles:body.data.audience==="restricted"?body.data.allowedRoles:[],
      topics:body.data.topics,
      status:body.data.status,
      content:body.data.content,
      updated_by:user.id,
      updated_at:new Date().toISOString(),
    };
    if(documentId){
      const {error}=await service.from("leo_knowledge_documents").update(payload).eq("id",documentId);
      if(error) throw error;
    }else{
      const {data,error}=await service.from("leo_knowledge_documents").insert({...payload,created_by:user.id}).select("id").single();
      if(error) throw error;
      documentId=data.id;
    }
    await service.from("leo_knowledge_chunks").delete().eq("document_id",documentId);
    if(chunks.length){
      const {error}=await service.from("leo_knowledge_chunks").insert(chunks.map((c,i)=>({document_id:documentId,chunk_index:i,heading:c.heading||body.data.title,content:c.content})));
      if(error) throw error;
    }
    return json({saved:true,id:documentId,chunkCount:chunks.length});
  }catch(error){
    console.error("leo-knowledge-admin",error);
    return json({error:"Leo knowledge-base operation failed"},500);
  }
});