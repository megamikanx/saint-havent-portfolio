/**
 * Turns the URLs the artist pastes into Sanity into embeddable players.
 * Studio validation (studio/schemaTypes/lib/embeds.ts) uses the same patterns;
 * keep the two in sync.
 */

export type ParsedVideo =
  | { provider: "youtube"; id: string }
  | { provider: "vimeo"; id: string; hash?: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** Accepts youtube.com/watch?v=, youtu.be/, /embed/, /shorts/ and vimeo.com/ URLs. */
export function parseVideoUrl(input: string): ParsedVideo | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    return YOUTUBE_ID.test(parts[0] ?? "") ? { provider: "youtube", id: parts[0]! } : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const id = url.searchParams.get("v") ?? (["embed", "shorts", "live"].includes(parts[0] ?? "") ? parts[1] : undefined);
    return id && YOUTUBE_ID.test(id) ? { provider: "youtube", id } : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    // vimeo.com/123, vimeo.com/123/abcdef (unlisted), player.vimeo.com/video/123?h=abcdef
    const idIndex = parts.findIndex((p) => /^\d+$/.test(p));
    if (idIndex === -1) return null;
    const hash = url.searchParams.get("h") ?? (/^[a-f0-9]+$/i.test(parts[idIndex + 1] ?? "") ? parts[idIndex + 1] : undefined);
    return { provider: "vimeo", id: parts[idIndex]!, ...(hash ? { hash } : {}) };
  }
  return null;
}

/** The iframe URL, with autoplay because it only loads after the visitor clicks Play. */
export function videoEmbedUrl(video: ParsedVideo): string {
  if (video.provider === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`;
  }
  const hash = video.hash ? `&h=${video.hash}` : "";
  return `https://player.vimeo.com/video/${video.id}?autoplay=1&dnt=1${hash}`;
}

export type VideoThumbnail = { src: string; width: number; height: number };

/**
 * Thumbnail for the click-to-play facade. YouTube thumbnails have a fixed URL;
 * Vimeo needs an oEmbed lookup, done once at build time.
 */
export async function videoThumbnail(video: ParsedVideo, originalUrl: string): Promise<VideoThumbnail | null> {
  if (video.provider === "youtube") {
    return { src: `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`, width: 480, height: 360 };
  }
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?width=1280&url=${encodeURIComponent(originalUrl)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail_url?: string; thumbnail_width?: number; thumbnail_height?: number };
    if (!data.thumbnail_url) return null;
    return { src: data.thumbnail_url, width: data.thumbnail_width ?? 1280, height: data.thumbnail_height ?? 720 };
  } catch {
    return null;
  }
}

export type BandcampEmbed = { type: "album" | "track"; id: string; url?: string };

const bandcampCache = new Map<string, Promise<BandcampEmbed | null>>();

/**
 * Accepts either a Bandcamp embed code (the <iframe> from Share/Embed) or a
 * plain album/track URL. A plain URL doesn't contain the numeric ID the player
 * needs, so the page is fetched once at build time to read it.
 */
export function resolveBandcamp(input: string): Promise<BandcampEmbed | null> {
  const key = input.trim();
  if (!bandcampCache.has(key)) bandcampCache.set(key, resolveBandcampUncached(key));
  return bandcampCache.get(key)!;
}

async function resolveBandcampUncached(input: string): Promise<BandcampEmbed | null> {
  const fromEmbed = input.match(/EmbeddedPlayer\/(?:v=2\/)?(album|track)=(\d+)/);
  if (fromEmbed) {
    const link = input.match(/href="([^"]+)"/)?.[1];
    return { type: fromEmbed[1] as "album" | "track", id: fromEmbed[2]!, ...(link ? { url: link } : {}) };
  }

  if (!/^https:\/\/[^\s]+\/(album|track)\/[^\s]+$/.test(input)) return null;
  try {
    const res = await fetch(input, { headers: { "user-agent": "Mozilla/5.0 (site build)" } });
    if (!res.ok) return null;
    const html = await res.text();
    // <meta name="bc-page-properties" content="{&quot;item_type&quot;:&quot;t&quot;,&quot;item_id&quot;:123}">
    const props = html.match(/name="bc-page-properties"\s+content="([^"]+)"/)?.[1]?.replace(/&quot;/g, '"');
    if (!props) return null;
    const parsed = JSON.parse(props) as { item_type?: string; item_id?: number };
    if (!parsed.item_id) return null;
    return { type: parsed.item_type === "a" ? "album" : "track", id: String(parsed.item_id), url: input };
  } catch {
    return null;
  }
}

/** A compact player (small artwork) because the cover is already shown beside it. */
export function bandcampEmbedUrl(embed: BandcampEmbed): string {
  return `https://bandcamp.com/EmbeddedPlayer/${embed.type}=${embed.id}/size=large/bgcol=ffffff/linkcol=1a1a1a/artwork=small/transparent=true/`;
}
