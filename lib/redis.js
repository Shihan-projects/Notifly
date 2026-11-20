import { Redis } from "@upstash/redis";

// Works with env var names from either the Upstash or the Vercel Marketplace integration.
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

// Counts auto-expire so a missed reset never leaves the light stuck on.
export const TTL_SECONDS = 12 * 60 * 60;
