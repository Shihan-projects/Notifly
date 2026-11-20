import { verifyDevice } from "../lib/auth.js";
import { redis } from "../lib/redis.js";

// Optional: a push button on the ESP32 calls this to clear the light.
export async function POST(request) {
  if (!verifyDevice(request)) return new Response("unauthorized", { status: 401 });

  await redis.mset({ dm: 0, m: 0 });
  return Response.json({ dm: 0, m: 0 });
}
