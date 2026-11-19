/**
 * Cloudflare Pages Function: POST /api/contact
 *
 * 1. Rejects oversized, cross-site and too-frequent requests
 * 2. Validates the fields (same rules as the browser, from src/lib/contact.ts)
 * 3. Verifies the Cloudflare Turnstile token with Cloudflare
 * 4. Emails the artist (reply-to = the client) and sends the client a confirmation, via Resend
 *
 * Nothing is stored: there is no database. Secrets come from environment
 * variables set in the Cloudflare dashboard (or web/.dev.vars locally).
 */
import {
  ENQUIRY_TYPES,
  HONEYPOT_FIELD,
  normalise,
  validateContact,
  type ContactInput,
  type ContactResponse,
} from "../../src/lib/contact.ts";
import { t, type UIKey } from "../../src/i18n/index.ts";

interface Env {
  RESEND_API_KEY: string;
  TURNSTILE_SECRET_KEY: string;
  /** Fallback recipient if no notification email is set in Sanity's Site settings. */
  ARTIST_NOTIFICATION_EMAIL: string;
  /** Verified sender in Resend, e.g. "Saint Haven't <hello@yourdomain.com>". */
  CONTACT_FROM_EMAIL: string;
  PUBLIC_SANITY_PROJECT_ID?: string;
  PUBLIC_SANITY_DATASET?: string;
}

const MAX_BODY_BYTES = 20_000;

/**
 * Best-effort rate limit: 5 submissions per IP per 10 minutes, per Worker
 * instance. Cloudflare may run several instances, so this is a backstop;
 * Turnstile is the main defence, and the README explains how to add a free
 * Cloudflare rate-limiting rule for stronger protection.
 */
const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };
const recent = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((time) => now - time < RATE_LIMIT.windowMs);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear(); // Keep memory bounded.
  return hits.length > RATE_LIMIT.max;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const wantsJson = (request.headers.get("accept") ?? "").includes("application/json");
  const respond = (body: ContactResponse, status = 200) => {
    if (wantsJson) return Response.json(body, { status });
    // No-JS fallback: send the browser to a static result page.
    const url = new URL(body.ok ? "/contact/thanks/" : "/contact/error/", request.url);
    return Response.redirect(url.toString(), 303);
  };
  const fail = (error: "turnstile" | "rateLimit" | "server", key: UIKey, status: number) =>
    respond({ ok: false, error, message: t(key) }, status);

  // Reject requests posted from other websites.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return fail("server", "contact.error.generic", 403);
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return fail("server", "contact.error.generic", 413);

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (isRateLimited(ip)) return fail("rateLimit", "contact.error.rateLimit", 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("server", "contact.error.generic", 400);
  }

  // Bots that fill the hidden honeypot get a fake success, so they don't retry.
  if (String(form.get(HONEYPOT_FIELD) ?? "").trim()) return respond({ ok: true });

  const input = normalise({
    name: form.get("name"),
    email: form.get("email"),
    enquiryType: form.get("enquiryType"),
    message: form.get("message"),
  });
  const errorKeys = validateContact(input);
  if (Object.keys(errorKeys).length) {
    const errors = Object.fromEntries(Object.entries(errorKeys).map(([field, key]) => [field, t(key)]));
    return respond({ ok: false, error: "validation", errors }, 422);
  }

  if (!env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL) {
    console.error("Contact form is missing required environment variables.");
    return fail("server", "contact.error.generic", 500);
  }

  const token = String(form.get("cf-turnstile-response") ?? "");
  if (!(await verifyTurnstile(token, ip, env.TURNSTILE_SECRET_KEY))) {
    return fail("turnstile", "contact.error.turnstile", 400);
  }

  const artistEmail = (await getNotificationEmail(env)) || env.ARTIST_NOTIFICATION_EMAIL;
  if (!artistEmail) {
    console.error("No notification email set in Sanity or ARTIST_NOTIFICATION_EMAIL.");
    return fail("server", "contact.error.generic", 500);
  }

  const typeLabel = t(`contact.enquiryType.${input.enquiryType as (typeof ENQUIRY_TYPES)[number]}`);

  // (a) Notification to the artist. Replying goes straight to the client.
  const notified = await sendEmail(env, {
    to: artistEmail,
    reply_to: input.email,
    subject: t("email.notification.subject", { type: typeLabel, name: singleLine(input.name) }),
    ...notificationBody(input, typeLabel),
  });
  if (!notified) return fail("server", "contact.error.generic", 502);

  // (b) Confirmation to the client. It deliberately doesn't repeat the name or
  // message, so the form can't be abused to send arbitrary text to strangers.
  const confirmation = t("email.confirmation.body", { type: typeLabel.toLowerCase() });
  const confirmed = await sendEmail(env, {
    to: input.email,
    reply_to: artistEmail,
    subject: t("email.confirmation.subject"),
    text: confirmation,
    html: `<p>${escapeHtml(confirmation).replace(/\n\n/g, "</p><p>")}</p>`,
  });
  // The artist already has the enquiry, so a failed confirmation isn't fatal.
  if (!confirmed) console.error("Confirmation email failed to send.");

  return respond({ ok: true });
};

// Anything other than POST gets 405 instead of the static 404 page.
export const onRequest: PagesFunction<Env> = async () =>
  new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });

async function verifyTurnstile(token: string, ip: string, secret: string): Promise<boolean> {
  if (!token) return false;
  const body = new FormData();
  body.append("secret", secret);
  body.append("response", token);
  if (ip !== "unknown") body.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

/** Reads the notification address from Sanity's Site settings, so the artist can change it without a redeploy. */
async function getNotificationEmail(env: Env): Promise<string | null> {
  if (!env.PUBLIC_SANITY_PROJECT_ID) return null;
  const dataset = env.PUBLIC_SANITY_DATASET || "production";
  const query = encodeURIComponent(`*[_id == "siteSettings"][0].notificationEmail`);
  try {
    const res = await fetch(
      `https://${env.PUBLIC_SANITY_PROJECT_ID}.apicdn.sanity.io/v2026-11-01/data/query/${dataset}?query=${query}`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (!res.ok) return null;
    const { result } = (await res.json()) as { result?: unknown };
    return typeof result === "string" && result.includes("@") ? result.trim() : null;
  } catch {
    return null;
  }
}

type Email = { to: string; reply_to: string; subject: string; text: string; html: string };

async function sendEmail(env: Env, email: Email): Promise<boolean> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.CONTACT_FROM_EMAIL, ...email }),
    });
    if (!res.ok) console.error("Resend error", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("Resend request failed", err);
    return false;
  }
}

function notificationBody(input: ContactInput, typeLabel: string) {
  const rows: [string, string][] = [
    [t("contact.name"), input.name],
    [t("contact.email"), input.email],
    [t("contact.enquiryType"), typeLabel],
  ];
  const intro = t("email.notification.intro");
  const text = [intro, "", ...rows.map(([k, v]) => `${k}: ${v}`), "", `${t("contact.message")}:`, input.message].join("\n");
  const html = `<p>${escapeHtml(intro)}</p>
<table cellpadding="4">${rows.map(([k, v]) => `<tr><th align="left">${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join("")}</table>
<p><strong>${escapeHtml(t("contact.message"))}:</strong></p>
<p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`;
  return { text, html };
}

/** Escapes user input before it goes into an HTML email. */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Removes line breaks so user input can't add extra email headers via the subject. */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").slice(0, 100);
}
