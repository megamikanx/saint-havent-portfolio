# Saint Haven't — portfolio website

Portfolio site for photography, videography and music. The artist edits all content in Sanity Studio, and the site rebuilds automatically a few minutes after each publish.

| Part | Technology | Hosting | Cost |
|---|---|---|---|
| Website (`web/`) | Astro 7, static output, TypeScript | Cloudflare Pages | Free plan |
| Contact form backend | One Cloudflare Pages Function (`web/functions/api/contact.ts`) | Cloudflare Pages | Free plan |
| CMS (`studio/`) | Sanity Studio v6 | `<name>.sanity.studio` | Sanity free plan |
| Email | Resend (REST API) | — | Free tier |
| Spam protection | Cloudflare Turnstile, verified on the server | — | Free |
| Analytics | Cloudflare Web Analytics (cookieless) | — | Free |

The goal is **$0/month apart from the domain**. There is no database: enquiries are emailed, not stored. Don't add paid services or extra infrastructure.

---

## Repository layout

```
web/                     Astro website
  src/pages/             One file per page (Home, About, Photography, Videography, Music, Contact, Privacy, 404)
  src/components/        Header, Footer, Img, PhotoGallery (+ lightbox), VideoFacade, ReleaseCard, ContactForm…
  src/lib/content.ts     All Sanity queries; falls back to placeholders.ts when Sanity isn't set up
  src/lib/embeds.ts      Parses YouTube/Vimeo URLs and Bandcamp links/embed codes into players
  src/lib/contact.ts     Contact form validation, shared by the browser and the server
  src/i18n/en.ts         Every UI string (see "Adding Mandarin" below)
  functions/api/contact.ts  Cloudflare Pages Function: validates, verifies Turnstile, sends emails via Resend
  public/_headers        Security and caching headers for Cloudflare Pages
studio/                  Sanity Studio
  schemaTypes/           Content model (site settings, pages, photos, collections, videos, releases)
  sanity.config.ts       Studio sidebar, singletons, drag-to-reorder lists
CMS-GUIDE.md             Plain-English guide for the artist
.env.example             Every environment variable, and where each one goes
```

`web/` and `studio/` are independent npm packages, each with its own lock file. Run npm commands inside each folder.

---

## Local setup

Requirements: Node.js 24 (Astro 7 needs 22.23 or newer) and npm.

### Website

```bash
cd web
npm install
cp ../.env.example .env      # then fill in the PUBLIC_* values and SITE_URL (or leave empty for placeholders)
npm run dev                  # http://localhost:4321
```

With no `PUBLIC_SANITY_PROJECT_ID`, the site builds with **placeholder content**, which is useful for design work and CI.

`npm run dev` doesn't run the contact Function. To test the form end to end:

```bash
# web/.dev.vars (never commit this file)
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA   # Cloudflare's always-pass test secret
RESEND_API_KEY=re_...
CONTACT_FROM_EMAIL=Saint Haven't <hello@yourdomain.com>
ARTIST_NOTIFICATION_EMAIL=you@example.com
```

Set `PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA` in `web/.env`, then:

```bash
npm run build && npm run preview   # wrangler pages dev, http://localhost:8788
```

Other scripts: `npm run check` type-checks the Astro files and the Function.

### Studio

```bash
cd studio
npm install
cp ../.env.example .env      # fill in SANITY_STUDIO_PROJECT_ID, SANITY_STUDIO_DATASET, SANITY_STUDIO_HOSTNAME
npm run dev                  # http://localhost:3333
```

To create a Sanity project, sign in at https://www.sanity.io/manage and create a new project with a `production` dataset. Add `http://localhost:3333` under **API → CORS origins** (with credentials allowed) if it isn't there already.

---

## Environment variables

`.env.example` lists all of them. Summary:

| Variable | Used by | Secret? | Notes |
|---|---|---|---|
| `PUBLIC_SANITY_PROJECT_ID` | web build, Function | No | Empty = placeholder content |
| `PUBLIC_SANITY_DATASET` | web build, Function | No | Usually `production` |
| `SITE_URL` | web build | No | Live URL, no trailing slash. Used for canonical links, Open Graph and the sitemap |
| `PUBLIC_TURNSTILE_SITE_KEY` | web build | No | Shown in the page's HTML |
| `TURNSTILE_SECRET_KEY` | Function | **Yes** | |
| `RESEND_API_KEY` | Function | **Yes** | |
| `CONTACT_FROM_EMAIL` | Function | No | Must use a domain verified in Resend |
| `ARTIST_NOTIFICATION_EMAIL` | Function | No | Fallback if Sanity's "Contact form email address" is empty |
| `PUBLIC_CF_ANALYTICS_TOKEN` | web build | No | Optional; see Analytics below |
| `SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET`, `SANITY_STUDIO_HOSTNAME` | Studio | No | `studio/.env` |

Secrets live only in `web/.dev.vars` (locally) and in Cloudflare's encrypted secrets. `.gitignore` excludes `.env*` and `.dev.vars`.

---

## Deployment

### 1. Sanity Studio → sanity.studio

```bash
cd studio
npm run deploy     # first run asks you to confirm the hostname (SANITY_STUDIO_HOSTNAME)
```

The Studio is then live at `https://<hostname>.sanity.studio`. Invite the artist in https://www.sanity.io/manage → **Members** with the **Editor** role.

### 2. Website → Cloudflare Pages

In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and pick this repository.

| Setting | Value |
|---|---|
| Production branch | `main` |
| Framework preset | Astro |
| Root directory | `web` |
| Build command | `npm run build` |
| Build output directory | `dist` |

Under **Settings → Variables and Secrets**, add every web variable from the table above. Mark `TURNSTILE_SECRET_KEY` and `RESEND_API_KEY` as **Secret**. The Function in `web/functions/` deploys automatically with the site.

**Custom domain:** **Custom domains → Set up a domain**. HTTPS is automatic. Then set `SITE_URL` to the domain and redeploy.

### 3. Resend (email)

1. Create a free account at https://resend.com and **add your domain**. Add the DNS records it shows (easiest if the domain's DNS is on Cloudflare).
2. Create an API key with "Sending access" → `RESEND_API_KEY`.
3. Set `CONTACT_FROM_EMAIL` to an address on that domain, e.g. `Saint Haven't <hello@yourdomain.com>`.

### 4. Turnstile (spam protection)

Cloudflare dashboard → **Turnstile → Add widget**. Add your domain (and `localhost` for testing), choose **Managed** mode, and copy the site key and secret key into the variables above.

### 5. Analytics

Simplest: in the Pages project, open **Metrics → Web Analytics** and enable it. Cloudflare injects its cookieless beacon automatically, so `PUBLIC_CF_ANALYTICS_TOKEN` can stay empty. (If you'd rather add the beacon manually, create a site under **Analytics & Logs → Web Analytics** and put its token in `PUBLIC_CF_ANALYTICS_TOKEN`.) No cookies are set, so no consent banner is needed.

---

## How publishing in Sanity rebuilds the site

The site is static, so content changes need a rebuild. A webhook does this automatically:

```
Artist clicks Publish in Sanity Studio
        │
        ▼
Sanity webhook  ──POST──►  Cloudflare Pages deploy hook
                                    │
                                    ▼
                     Cloudflare rebuilds web/ (fetches the latest content)
                                    │
                                    ▼
                         New version live in ~1–3 minutes
```

Setup:

1. **Cloudflare:** Pages project → **Settings → Builds → Deploy hooks → Add deploy hook**. Name it `sanity-publish`, branch `main`. Copy the URL. Treat it like a password: anyone with it can trigger builds.
2. **Sanity:** https://www.sanity.io/manage → project → **API → Webhooks → Create webhook**:
   - **URL:** the deploy hook URL
   - **Dataset:** `production`
   - **Trigger on:** Create, Update, Delete
   - **Filter:** leave empty (any published change rebuilds)
   - **HTTP method:** POST
   - Leave "Trigger webhook when drafts are modified" **off**, so only publishes trigger builds.
3. Publish any change in the Studio and watch **Deployments** in Cloudflare.

Cloudflare's free plan has a monthly build limit. Normal publishing stays well within it.

---

## Spam and abuse protection

The contact Function (`web/functions/api/contact.ts`):

- verifies the **Turnstile** token with Cloudflare on every submission
- rejects cross-site posts (Origin check) and bodies over 20 KB
- silently discards submissions that fill the hidden **honeypot** field
- applies a best-effort **rate limit** (5 per IP per 10 minutes, per Worker instance)
- validates every field on the server (same rules as the browser) and **escapes all user input** before putting it in the HTML email; the subject line is stripped of line breaks
- sends the client a confirmation that does **not** echo their message, so the form can't be used to send arbitrary text to strangers

For stronger rate limiting, add a free Cloudflare rule once the domain is on Cloudflare: **Security → WAF → Rate limiting rules**, matching `URI Path equals /api/contact` and method `POST`, with a block action.

The notification address can be changed by the artist in Sanity (Site settings → Contact form email address). On Sanity's free plan datasets are public, so this address can be read through Sanity's API. If that's a concern, leave the Sanity field empty and use `ARTIST_NOTIFICATION_EMAIL` only.

---

## Performance and accessibility notes

- Images come from Sanity's image pipeline with `auto=format` (AVIF/WebP), a responsive `srcset`, explicit `width`/`height`, and `loading="lazy"` below the fold. The first visible image on each page loads eagerly with `fetchpriority="high"`.
- YouTube/Vimeo and Bandcamp players are **facades**: no third-party code loads until the visitor clicks Play.
- JavaScript is limited to small scripts for the mobile menu, the lightbox, the facades and the contact form (about 6 KB in total).
- Accessibility: `lang="en"`, skip link, semantic landmarks, visible focus outlines, labelled form fields with linked error messages, a lightbox built on the native `<dialog>` (keyboard, Escape, swipe, focus trapped and restored), `prefers-reduced-motion` support, and AA colour contrast.
- Run Lighthouse (mobile) or PageSpeed Insights against the deployed site to confirm LCP < 2.5s, INP < 200ms and CLS < 0.1 with real content.

---

## Adding Mandarin later

All UI text is in `web/src/i18n/en.ts`, and components call `t("key")`.

1. Copy `en.ts` to `zh.ts` and translate the values.
2. Register it in `web/src/i18n/index.ts` (`locales`, `htmlLang: { zh: "zh-Hans" }`).
3. Add Astro's `i18n` routing in `astro.config.mjs` (e.g. `/zh/...` pages) and pass the locale to `t()`.
4. For CMS content, add Sanity's document- or field-level internationalisation plugin.

---

## CI

`.github/workflows/ci.yml` runs on every pull request: `npm ci`, type checks and a production build for both `web/` and `studio/`. The final job is named `check`, which is the status the `main` branch-protection rule requires.
