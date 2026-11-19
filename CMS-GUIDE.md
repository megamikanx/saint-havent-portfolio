# Editing your website: a guide

Everything on your website (photos, videos, music, and the text on every page) is edited in **Sanity Studio**, a website you log in to. You don't need to touch any code.

---

## Logging in

1. Go to your Studio address: **https://YOUR-NAME.sanity.studio** (your developer will send you the exact link).
2. Log in with the Google, GitHub or email account you were invited with.

On the left is the menu:

- **Site settings**: your site name, social links, share image and the email address for contact form messages
- **Pages**: the headings and text on each page
- **Photos**, **Shoots / series**, **Videos**, **Music releases**: your work

---

## Publishing: how changes go live

Nothing you type appears on the website until you click the green **Publish** button at the bottom right.

- Before you publish, your changes are saved automatically as a **draft** that only you can see.
- After you click **Publish**, the website updates by itself in **about 1–3 minutes**. Refresh the page to see it.
- Made a mistake? Click **⋯** next to Publish and choose **Discard changes** to go back to the published version.

Every field has a short explanation underneath it. If something is required or needs fixing, a red message tells you what to do, and Publish won't work until it's fixed.

---

## Photos

### Add a photo
1. Click **Photos** in the menu, then the **+** button (Create new).
2. Under **Photo**, drag in an image or click **Upload**. Use the highest-quality file you have. The website makes smaller, faster versions automatically.
3. **Alt text** (required): describe what's in the photo in one short sentence, as if to someone who can't see it. Example: *"Singer on stage under red lights, holding a microphone."* This helps blind visitors and search engines.
4. **Caption** (optional): appears under the photo, e.g. the subject, location or client.
5. **Shoot / series**: pick which shoot this photo belongs to (see below).
6. Click **Publish**.

**Tip — choosing the crop:** thumbnails on the website are cropped. Click the **crop icon** on the image and drag the circle onto the most important part (a face, for example) so it's never cut off.

### Reorder photos
1. Click **Photos**. The list is in the same order as the website.
2. **Drag** a photo up or down using the handle on its left. The new order saves straight away; the website updates in a few minutes.

### Remove a photo
Open the photo, click **⋯** next to Publish, then **Delete**, and confirm.

### Shoots (how the Photography page is organised)
The Photography page lists your shoots, each with a large cover photo and a short description. Clicking one opens that shoot's own page with all its photos.

1. Click **Shoots / series** → **+**. Give it a name (e.g. *"Tour 2026"*), click **Generate** next to **Page address**, add a wide **Cover photo** (with alt text) and an optional description. **Publish**.
2. Open each photo you want in it, choose the shoot in the **Shoot / series** field, and **Publish**.
3. Drag shoots in **Shoots / series** to change their order on the Photography page.

Photos that aren't in any shoot appear at the end of the Photography page, under "More work".

---

## Videos

### Add a video
1. Upload the video to **YouTube** or **Vimeo** first.
2. In the Studio, click **Videos** → **+**.
3. **Title**: shown under the video.
4. **YouTube or Vimeo link**: copy the link from your browser's address bar or the video's **Share** button and paste it here, e.g. `https://www.youtube.com/watch?v=…` or `https://vimeo.com/123456789`. The player is created automatically; you don't need any embed code.
5. **Description** (optional).
6. **Publish**.

The website shows the video's thumbnail with a play button. The video itself only loads when a visitor clicks it, which keeps your site fast.

**Reorder** by dragging in the **Videos** list. **Remove** with **⋯ → Delete**.

---

## Music

### Add a release
1. Click **Music releases** → **+**.
2. **Title** and **Year**.
3. **Cover art**: upload the square artwork and fill in its **alt text** (e.g. *"Album cover: a black-and-white photo of a city at night"*).
4. **Bandcamp link or embed code**: paste either
   - the link to the album or track page, e.g. `https://yourname.bandcamp.com/album/…`, **or**
   - the embed code from Bandcamp (on the release page: **Share / Embed → Embed this album** → copy the code).
5. **Publish**.

Visitors see the cover, title and year, with a button that loads the Bandcamp player.

**Reorder** by dragging in the **Music releases** list. **Remove** with **⋯ → Delete**.

---

## Editing page text

Click **Pages**, then the page you want. On the **Home** page you can also choose the two **Featured photos** shown side by side at the top (drag to swap them).

For every page:

- **Page heading**: the big title at the top.
- **Intro text**: a sentence or two under the heading.
- **Search engine description**: what Google shows under your page title (keep it under about 160 characters). Optional.

The **About** page also has:

- **Bio**: your biography. Use the toolbar for **bold**, *italic*, links, lists and subheadings. Keep paragraphs short so it reads well on phones.
- **Portrait**: a photo of you, with alt text.

The **Privacy Policy** page uses a ready-made policy until you write your own. If you do edit it, keep the key points: the contact form collects name, email and message; they're used only to reply; messages are emailed and not stored; and analytics don't use cookies.

Click **Publish** after editing.

---

## Site settings

- **Site title**: your brand, shown in browser tabs and search results (and as the logo if you haven't uploaded one).
- **Your name (for the © line)**: shown at the bottom of every page.
- **Logo**: optional image shown at the top of every page.
- **Default search engine description**: one or two sentences about you, used in Google results.
- **Default share image**: the picture that appears when someone shares a link to your site. Best size: 1200 × 630 (landscape).
- **Social and streaming links**: shown in every page's footer and on the About page. Click **Add item**, choose the platform and paste the full link. Drag to reorder.
- **Contact form email address**: where contact form messages are delivered. Messages arrive with the sender's email as the reply-to, so you can just hit **Reply**.

---

## Viewing your visitor numbers (analytics)

Your site uses **Cloudflare Web Analytics**, which counts visits without cookies or tracking, so there's no cookie banner.

1. Log in at **https://dash.cloudflare.com** (ask your developer to invite you to the account if you don't have access).
2. Open **Workers & Pages**, click your site, then **Metrics** → **Web Analytics**. (It's also under **Analytics & Logs → Web Analytics** in the main menu.)
3. You'll see visits, page views, the most popular pages, countries, devices and where visitors came from. Use the date picker at the top to change the period.

---

## Quick troubleshooting

- **My change isn't on the website.** Did you click **Publish**? Wait 3 minutes and refresh. Still not there? Ask your developer to check the deployment.
- **Publish is greyed out.** A field needs fixing; look for the red message (often missing alt text).
- **The video or music player won't show.** Check the link is a YouTube/Vimeo video link, or a Bandcamp album/track link or embed code. The field shows an error if it isn't recognised.
- **I deleted something by mistake.** Ask your developer; Sanity keeps a history and deleted items can usually be restored.
