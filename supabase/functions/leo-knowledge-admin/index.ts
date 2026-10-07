import { createClient } from "npm:@supabase/supabase-js@2.110.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.25.76";

const DocumentSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(140),
  title: z.string().trim().min(2).max(240),
  category: z.string().trim().min(2).max(80),
  audience: z.enum(["public","staff","role_restricted"]),
  allowed_roles: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  content: z.string().trim().min(20).max(100000),
  source_name: z.string().trim().max(240).nullable().optional(),
  source_url: z.string().url().max(1000).nullable().optional(),
  version: z.number().int().min(1).optional(),
  status: z.enum(["draft","published","archived"]).default("draft"),
  review_date: z.string().date().nullable().optional(),
  expiry_date: z.string().date().nullable().optional(),
  metadata: z.record(z.unknown()).default({}),
});

const RequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("list"), status: z.enum(["draft","published","archived","all"]).default("all") }),
  z.object({ action: z.literal("get"), id: z.string().uuid() }),
  z.object({ action: z.literal("upsert"), document: DocumentSchema }),
  z.object({ action: z.literal("publish"), id: z.string().uuid() }),
  z.object({ action: z.literal("archive"), id: z.string().uuid() }),
  z.object({ action: z.literal("delete"), id: z.string().uuid() }),
  z.object({ action: z.literal("reindex"), id: z.string().uuid() }),
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const chunkText = (input: string, size = 1800, overlap = 250): string[] => {
  const text = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (!text) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + size, text.length);
    if (end < text.length) {
      const boundary = Math.max(text.lastIndexOf("\n", end), text.lastIndexOf(". ", end));
      if (boundary > start + Math.floor(size * 0.55)) end = boundary + 1;
    }
    chunks.push(text.slice(start, end).trim());
    if (end >= text.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks.filter(Boolean);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !anonKey || !serviceKey) return json({ error: "Leo knowledge service is not configured" }, 500);

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authError } = await userClient.auth.getUser(authHeader.slice(7));
    if (authError || !authData.user) return json({ error: "A valid signed-in account is required" }, 401);

    const service = createClient(supabaseUrl, serviceKey);
    const userId = authData.user.id;
    const [{ data: allowedByPermission, error: permissionError }, { data: globalAdmin, error: globalError }] =
      await Promise.all([
        service.rpc("user_has_permission", { _user_id: userId, _permission_key: "admin:manage_ai_knowledge" }),
        service.rpc("is_global_admin", { _user_id: userId }),
      ]);
    if (permissionError || globalError) {
      console.error("leo-knowledge-admin: authorization lookup failed", { permissionError, globalError });
      return json({ error: "Could not verify knowledge-management permission" }, 500);
    }
    if (!allowedByPermission && !globalAdmin) return json({ error: "Leo knowledge-management permission is required" }, 403);

    const raw = await req.json();
    const parsed = RequestSchema.safeParse(raw);
    if (!parsed.success) return json({ error: "Invalid knowledge-management request", details: parsed.error.flatten() }, 400);

    const action = parsed.data.action;

    if (action === "list") {
      let query = service
        .from("leo_knowledge_documents")
        .select("id,slug,title,category,audience,allowed_roles,version,status,source_name,review_date,expiry_date,approved_at,last_reviewed_at,created_at,updated_at")
        .order("updated_at", { ascending: false });
      if (parsed.data.status !== "all") query = query.eq("status", parsed.data.status);
      const { data, error } = await query;
      if (error) throw error;
      return json({ documents: data ?? [] });
    }

    if (action === "get") {
      const { data, error } = await service
        .from("leo_knowledge_documents")
        .select("*")
        .eq("id", parsed.data.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return json({ error: "Knowledge document not found" }, 404);
      const { data: chunks, error: chunksError } = await service
        .from("leo_knowledge_chunks")
        .select("id,chunk_index,content,metadata")
        .eq("document_id", parsed.data.id)
        .order("chunk_index");
      if (chunksError) throw chunksError;
      return json({ document: data, chunks: chunks ?? [] });
    }

    if (action === "delete") {
      const { error } = await service.from("leo_knowledge_documents").delete().eq("id", parsed.data.id);
      if (error) throw error;
      return json({ deleted: true, id: parsed.data.id });
    }

    if (action === "publish" || action === "archive") {
      const status = action === "publish" ? "published" : "archived";
      const patch: Record<string, unknown> = { status, updated_by: userId };
      if (action === "publish") {
        patch.approved_by = userId;
        patch.approved_at = new Date().toISOString();
        patch.last_reviewed_at = new Date().toISOString();
      }
      const { data, error } = await service
        .from("leo_knowledge_documents")
        .update(patch)
        .eq("id", parsed.data.id)
        .select("id,slug,title,status,version,approved_at,last_reviewed_at")
        .single();
      if (error) throw error;
      return json({ document: data });
    }

    if (action === "reindex") {
      const { data: document, error: documentError } = await service
        .from("leo_knowledge_documents")
        .select("id,content,version")
        .eq("id", parsed.data.id)
        .maybeSingle();
      if (documentError) throw documentError;
      if (!document) return json({ error: "Knowledge document not found" }, 404);

      const chunks = chunkText(document.content);
      await service.from("leo_knowledge_chunks").delete().eq("document_id", document.id);
      if (chunks.length) {
        const rows = chunks.map((content, chunk_index) => ({
          document_id: document.id,
          chunk_index,
          content,
          metadata: { chunking: "fixed-overlap", size: 1800, overlap: 250 },
        }));
        const { error } = await service.from("leo_knowledge_chunks").insert(rows);
        if (error) throw error;
      }
      await service.from("leo_knowledge_documents").update({
        updated_by: userId,
        updated_at: new Date().toISOString(),
      }).eq("id", document.id);
      return json({ reindexed: true, id: document.id, chunkCount: chunks.length });
    }

    if (action === "upsert") {
      const document = parsed.data.document;
      if (document.audience !== "role_restricted" && document.allowed_roles.length) {
        return json({ error: "allowed_roles may only be used for role-restricted knowledge" }, 400);
      }
      if (document.audience === "role_restricted" && document.allowed_roles.length === 0) {
        return json({ error: "Role-restricted knowledge requires at least one allowed role" }, 400);
      }
      if (document.expiry_date && document.review_date && document.expiry_date < document.review_date) {
        return json({ error: "expiry_date cannot be earlier than review_date" }, 400);
      }

      const payload = {
        slug: document.slug,
        title: document.title,
        category: document.category,
        audience: document.audience,
        allowed_roles: document.allowed_roles,
        content: document.content,
        source_name: document.source_name ?? null,
        source_url: document.source_url ?? null,
        version: document.version ?? 1,
        status: document.status,
        review_date: document.review_date ?? null,
        expiry_date: document.expiry_date ?? null,
        metadata: document.metadata,
        updated_by: userId,
        ...(document.status === "published" ? {
          approved_by: userId,
          approved_at: new Date().toISOString(),
          last_reviewed_at: new Date().toISOString(),
        } : {}),
      };

      let saved;
      if (document.id) {
        const { data, error } = await service
          .from("leo_knowledge_documents")
          .update(payload)
          .eq("id", document.id)
          .select("*")
          .single();
        if (error) throw error;
        saved = data;
      } else {
        const { data, error } = await service
          .from("leo_knowledge_documents")
          .insert({ ...payload, created_by: userId })
          .select("*")
          .single();
        if (error) throw error;
        saved = data;
      }

      const chunks = chunkText(saved.content);
      await service.from("leo_knowledge_chunks").delete().eq("document_id", saved.id);
      if (chunks.length) {
        const { error } = await service.from("leo_knowledge_chunks").insert(
          chunks.map((content, chunk_index) => ({
            document_id: saved.id,
            chunk_index,
            content,
            metadata: { chunking: "fixed-overlap", size: 1800, overlap: 250 },
          })),
        );
        if (error) throw error;
      }

      return json({ document: saved, chunkCount: chunks.length });
    }

    return json({ error: "Unsupported action" }, 400);
  } catch (error) {
    console.error("leo-knowledge-admin: request failed", error);
    return json({ error: "Leo knowledge operation failed" }, 500);
  }
});
