import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, range",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Expose-Headers": "Accept-Ranges, Content-Length, Content-Range, ETag",
  "Accept-Ranges": "bytes",
};

const reply = (message: string, status: number) =>
  new Response(message, { status, headers: cors });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "GET" && req.method !== "HEAD") return reply("Method not allowed", 405);

  const auth = req.headers.get("Authorization") || "";
  const token = auth.match(/^Bearer\s+(.+)$/i)?.[1] || "";
  if (!token) return reply("Sign in required", 401);

  const url = new URL(req.url);
  const trackId = url.searchParams.get("track_id");
  const mode = url.searchParams.get("mode") || "stream";
  if (!trackId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trackId) || !["stream", "download"].includes(mode)) {
    return reply("Invalid request", 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return reply("Audio service unavailable", 503);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return reply("Unauthorized", 401);

  const { data: track, error: trackError } = await admin.from("tracks")
    .select("id,audio_path,title,is_vip_only_download,is_deleting")
    .eq("id", trackId).maybeSingle();
  if (trackError || !track || !track.audio_path || track.is_deleting) return reply("Track not found", 404);

  if (mode === "download" && track.is_vip_only_download) {
    const { data: entitlement, error: vipError } = await admin.from("vip_entitlements")
      .select("is_active").eq("user_id", authData.user.id).maybeSingle();
    if (vipError || !entitlement?.is_active) return reply("VIP membership required", 403);
  }

  const objectPath = String(track.audio_path).replace(/^\/+/, "");
  if (!objectPath || objectPath.split("/").some((part) => part === "." || part === "..")) {
    return reply("Invalid audio object", 500);
  }

  const objectUrl = `${supabaseUrl}/storage/v1/object/tracks/${objectPath.split("/").map(encodeURIComponent).join("/")}`;
  const headersIn = new Headers({ apikey: serviceKey, Authorization: `Bearer ${serviceKey}` });
  const range = req.headers.get("Range");
  if (range) headersIn.set("Range", range);

  const upstream = await fetch(objectUrl, { method: req.method, headers: headersIn });
  if (!upstream.ok && upstream.status !== 206) {
    return reply("Audio object unavailable", upstream.status === 404 ? 404 : 502);
  }

  const headersOut = new Headers(cors);
  headersOut.set("Content-Type", upstream.headers.get("Content-Type") || "audio/mpeg");
  headersOut.set("Cache-Control", "private, no-store");
  const safeTitle = String(track.title || "track").replace(/[^a-zA-Z0-9_-]/g, "_");
  headersOut.set("Content-Disposition", mode === "download" ? `attachment; filename="${safeTitle}.mp3"` : "inline");
  for (const name of ["Content-Length", "Content-Range", "Accept-Ranges", "ETag", "Last-Modified"]) {
    const value = upstream.headers.get(name);
    if (value) headersOut.set(name, value);
  }

  return new Response(req.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers: headersOut,
  });
});
