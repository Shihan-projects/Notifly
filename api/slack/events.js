import { verifySlack } from "../../lib/auth.js";
import { redis, TTL_SECONDS } from "../../lib/redis.js";

const ok = () => new Response("ok", { status: 200 });

export async function POST(request) {
  const raw = await request.text();
  if (!verifySlack(request, raw)) return new Response("unauthorized", { status: 401 });

  const body = JSON.parse(raw);

  // One-time check when you paste the Request URL into Slack.
  if (body.type === "url_verification") {
    return Response.json({ challenge: body.challenge });
  }
  if (body.type !== "event_callback" || !body.event) return ok();

  // Slack retries reuse the same event_id: count each event only once.
  const fresh = await redis.set(`ev:${body.event_id}`, 1, { nx: true, ex: 600 });
  if (!fresh) return ok();

  const ev = body.event;
  // Ignore edits, deletes, joins, bot posts etc. (they all carry a subtype).
  if (ev.type !== "message" || ev.subtype) return ok();

  const me = process.env.MY_USER_ID;
  const fromMe = ev.user === me;

  if (ev.channel_type === "im") {
    if (ev.user === "USLACKBOT") return ok();
    if (fromMe) await redis.set("dm", 0);           // you replied in a DM -> seen
    else await bump("dm");
  } else if (ev.channel === process.env.CHANNEL_ID) {
    if (fromMe) await redis.set("m", 0);            // you posted in the channel -> seen
    else if ((ev.text || "").includes(`<@${me}>`)) await bump("m");
  }
  // Every other channel is ignored. Message text is never stored or logged.

  return ok();
}

async function bump(key) {
  await redis.incr(key);
  await redis.expire(key, TTL_SECONDS);
}
