import { verifyDevice } from "../lib/auth.js";
import { redis } from "../lib/redis.js";

// ESP32 polls this. Returns only counts: {"dm":0,"m":1}
export async function GET(request) {
  if (!verifyDevice(request)) return new Response("unauthorized", { status: 401 });

  const [dm, m] = await redis.mget("dm", "m");
  return Response.json(
    { dm: Number(dm) || 0, m: Number(m) || 0 },
    { headers: { "cache-control": "no-store" } }
  );
}
