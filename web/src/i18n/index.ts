import { en, type UIKey } from "./en.ts";

/** Locales the site supports. Add "zh" here (and a zh.ts file) to add Mandarin. */
export const locales = { en } as const;
export type Locale = keyof typeof locales;
export const defaultLocale: Locale = "en";

/** Value for <html lang>. Use "zh-Hans" for Simplified Chinese later. */
export const htmlLang: Record<Locale, string> = { en: "en" };

/**
 * Look up a UI string and fill in {placeholders}.
 * Example: t("lightbox.counter", { current: 2, total: 10 })
 */
export function t(
  key: UIKey,
  vars: Record<string, string | number> = {},
  locale: Locale = defaultLocale,
): string {
  const template: string = locales[locale][key] ?? en[key];
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export type { UIKey };
