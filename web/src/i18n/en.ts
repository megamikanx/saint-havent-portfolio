/**
 * Every piece of UI text that isn't edited in Sanity lives here.
 *
 * To add Mandarin later: copy this file to `zh.ts`, translate the values,
 * and register it in `./index.ts`. Components never hard-code UI strings;
 * they call `t("key")` instead.
 */
export const en = {
  "site.skipLink": "Skip to main content",
  "nav.label": "Main",
  "nav.home": "Home",
  "nav.works": "Works",
  "nav.about": "About",
  "nav.photography": "Photography",
  "nav.videography": "Videography",
  "nav.music": "Music",
  "nav.contact": "Contact",

  /*
   * Chinese text that is part of the visual design (from the Figma), not a
   * translation. Decorative only: hidden from screen readers.
   */
  "decor.nav.about": "关于",
  "decor.nav.works": "作品",
  "decor.nav.contact": "联系方式",
  "decor.page.about": "关于",
  "decor.page.photography": "摄影",
  "decor.page.videography": "视频",
  "decor.page.music": "音乐",
  "decor.page.contact": "联系方式",
  "decor.page.privacy": "隐私",
  "decor.slogan": "我就得你得要去死",
  "decor.footerWord": "大地",

  "footer.social": "Social links",
  "footer.privacy": "Privacy Policy",
  "footer.copyright": "© {year} {name}",
  "footer.newTab": "(opens in a new tab)",

  "photo.open": "Open photo: {alt}",
  "photo.empty": "Photos are coming soon.",
  "photo.otherWork": "More work",
  "photo.viewShoot": "View {title}",
  "photo.back": "All photography",
  "lightbox.label": "Photo viewer",
  "lightbox.close": "Close",
  "lightbox.previous": "Previous photo",
  "lightbox.next": "Next photo",
  "lightbox.counter": "{current} of {total}",

  "video.play": "Play video: {title}",
  "video.empty": "Videos are coming soon.",

  "music.play": "Load player for {title}",
  "music.listen": "Listen on Bandcamp",
  "music.empty": "Music is coming soon.",

  "about.portraitFallbackAlt": "Portrait",

  "contact.heading": "Contact",
  "contact.name": "Name",
  "contact.email": "Email",
  "contact.enquiryType": "Enquiry type",
  "contact.enquiryType.choose": "Choose one",
  "contact.enquiryType.photography": "Photography",
  "contact.enquiryType.videography": "Videography",
  "contact.enquiryType.music": "Music",
  "contact.enquiryType.other": "Other",
  "contact.message": "Message",
  "contact.required": "required",
  "contact.submit": "Submit",
  "contact.sending": "Sending…",
  "contact.privacyNote": "We only use your details to reply to you. See our {link}.",
  "contact.success.heading": "Thanks — your message has been sent.",
  "contact.success.body": "A confirmation is on its way to your inbox. Expect a reply soon.",
  "contact.error.generic": "Sorry, something went wrong and your message wasn't sent. Please try again, or email directly.",
  "contact.error.network": "We couldn't reach the server. Check your connection and try again.",
  "contact.error.turnstile": "Please complete the verification check and try again.",
  "contact.error.rateLimit": "Too many messages in a short time. Please wait a few minutes and try again.",
  "contact.error.fixFields": "Please fix the highlighted fields.",
  "contact.turnstileMissing": "Spam protection isn't configured yet, so the form can't be sent.",

  "validation.name.required": "Enter your name.",
  "validation.name.tooLong": "Name must be 100 characters or fewer.",
  "validation.email.required": "Enter your email address.",
  "validation.email.invalid": "Enter a valid email address, like name@example.com.",
  "validation.enquiryType.required": "Choose an enquiry type.",
  "validation.message.required": "Enter a message.",
  "validation.message.tooShort": "Message must be at least 10 characters.",
  "validation.message.tooLong": "Message must be 5,000 characters or fewer.",

  "email.notification.subject": "New {type} enquiry from {name}",
  "email.notification.intro": "You have a new enquiry from your website. Reply to this email to respond.",
  "email.confirmation.subject": "We received your message",
  "email.confirmation.body": "Hi,\n\nThanks for getting in touch about {type}. Your message has been received and you'll get a reply soon.\n\nThis is an automatic confirmation; please don't reply to it.",

  "privacy.updated": "Last updated",

  "notFound.heading": "Page not found",
  "notFound.body": "The page you're looking for doesn't exist or has moved.",
  "notFound.home": "Go to the home page",
} as const;

export type UIKey = keyof typeof en;
