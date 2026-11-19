/**
 * URL checks for the Studio's validation messages. These mirror the parsers
 * in web/src/lib/embeds.ts (which build the actual players); keep them in sync.
 */

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function isSupportedVideoUrl(input: string): boolean {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return false;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") return YOUTUBE_ID.test(parts[0] ?? "");
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const id = url.searchParams.get("v") ?? (["embed", "shorts", "live"].includes(parts[0] ?? "") ? parts[1] : undefined);
    return !!id && YOUTUBE_ID.test(id);
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") return parts.some((p) => /^\d+$/.test(p));
  return false;
}

export function isSupportedBandcamp(input: string): boolean {
  const value = input.trim();
  if (/EmbeddedPlayer\/(?:v=2\/)?(album|track)=\d+/.test(value)) return true;
  return /^https:\/\/[^\s]+\/(album|track)\/[^\s]+$/.test(value);
}
