import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const allowedOrigins = new Set([
  "https://mrsixson.github.io",
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
]);

function corsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-api-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
  if (allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

const json = (req: Request, body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json(req, { error: "Audio service unavailable" }, 503);

  const authorization = req.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) return json(req, { error: "Sign in required" }, 401);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json(req, { error: "Unauthorized" }, 401);

  let body: { track_id?: unknown };
  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid JSON body" }, 400);
  }

  const trackId = typeof body.track_id === "string" ? body.track_id : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(trackId)) {
    return json(req, { error: "Invalid track id" }, 400);
  }

  const { data: track, error: trackError } = await admin
    .from("tracks")
    .select("audio_path,is_deleting")
    .eq("id", trackId)
    .maybeSingle();

  if (trackError || !track || track.is_deleting || !track.audio_path) {
    return json(req, { error: "Track not found" }, 404);
  }

  const objectPath = String(track.audio_path).replace(/^\/+/, "");
  if (!objectPath || objectPath.split("/").some((part) => part === "." || part === "..")) {
    return json(req, { error: "Invalid audio object" }, 500);
  }

  const { data: signed, error: signError } = await admin.storage
    .from("tracks")
    .createSignedUrl(objectPath, 900);

  if (signError || !signed?.signedUrl) {
    console.error("audio-ticket signing failed:", signError?.message);
    return json(req, { error: "Could not authorize audio stream" }, 502);
  }

  return json(req, { signedUrl: signed.signedUrl, expiresIn: 900 });
});
