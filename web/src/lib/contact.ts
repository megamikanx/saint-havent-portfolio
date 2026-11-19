/**
 * Contact form rules, shared by the browser (instant inline errors) and the
 * Cloudflare Pages Function (the real check). Keep this file free of DOM and
 * Node APIs so it runs in both places.
 */
import type { UIKey } from "../i18n/en.ts";

export const ENQUIRY_TYPES = ["photography", "videography", "music", "other"] as const;
export type EnquiryType = (typeof ENQUIRY_TYPES)[number];

export const LIMITS = {
  nameMax: 100,
  emailMax: 254,
  messageMin: 10,
  messageMax: 5000,
} as const;

export type ContactInput = {
  name: string;
  email: string;
  enquiryType: string;
  message: string;
};

export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, UIKey>>;

// Deliberately simple: one @, no spaces, a dot in the domain. Stricter regexes
// reject real addresses; the confirmation email is the real test.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trims every field. Returns an empty string for missing values. */
export function normalise(raw: Partial<Record<ContactField, unknown>>): ContactInput {
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  return {
    name: str(raw.name),
    email: str(raw.email),
    enquiryType: str(raw.enquiryType),
    message: str(raw.message),
  };
}

/** Returns a map of field -> i18n error key. An empty object means valid. */
export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  if (!input.name) errors.name = "validation.name.required";
  else if (input.name.length > LIMITS.nameMax) errors.name = "validation.name.tooLong";

  if (!input.email) errors.email = "validation.email.required";
  else if (input.email.length > LIMITS.emailMax || !EMAIL_PATTERN.test(input.email))
    errors.email = "validation.email.invalid";

  if (!(ENQUIRY_TYPES as readonly string[]).includes(input.enquiryType))
    errors.enquiryType = "validation.enquiryType.required";

  if (!input.message) errors.message = "validation.message.required";
  else if (input.message.length < LIMITS.messageMin) errors.message = "validation.message.tooShort";
  else if (input.message.length > LIMITS.messageMax) errors.message = "validation.message.tooLong";

  return errors;
}

/** Name of the hidden "honeypot" field. Real people leave it empty; bots fill it in. */
export const HONEYPOT_FIELD = "website";

/** Shape of the JSON the Pages Function returns. */
export type ContactResponse =
  | { ok: true }
  | { ok: false; error: "validation"; errors: Partial<Record<ContactField, string>> }
  | { ok: false; error: "turnstile" | "rateLimit" | "server"; message: string };
