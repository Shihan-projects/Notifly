import crypto from "node:crypto";

function safeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

// Verifies a request really came from Slack (signing secret + 5-minute replay window).
export function verifySlack(request, rawBody) {
  const ts = request.headers.get("x-slack-request-timestamp");
  const sig = request.headers.get("x-slack-signature") || "";
  if (!ts || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;

  const expected =
    "v0=" +
    crypto
      .createHmac("sha256", process.env.SLACK_SIGNING_SECRET)
      .update(`v0:${ts}:${rawBody}`)
      .digest("hex");
  return safeEqual(expected, sig);
}

// Verifies the ESP32's device key, sent in the "x-device-key" header.
export function verifyDevice(request) {
  const key = request.headers.get("x-device-key") || "";
  const expected = process.env.DEVICE_KEY || "";
  return expected.length >= 32 && safeEqual(key, expected);
}
