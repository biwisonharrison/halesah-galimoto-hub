import "server-only";
import { cookies } from "next/headers";
import { LANG_COOKIE, type Lang } from "./i18n-shared";

export type { Lang };
export { LANG_COOKIE };

/**
 * Chichewa strings here are a good-faith, non-native translation covering
 * the site's static navigation chrome (header, footer, language switcher).
 * They should get a native-speaker review before this is treated as
 * production-quality copy. Homepage/marketplace/dashboard body content is
 * developer-editable (via the Developer Panel) and is intentionally left
 * out of this dictionary — there's no reliable way to auto-translate
 * arbitrary admin-entered text, so it always renders exactly as entered,
 * in whichever language the developer wrote it in.
 */
export const translations = {
  nav_buy: { en: "Buy a car", ny: "Gulani galimoto" },
  nav_sell: { en: "Sell your car", ny: "Gulitsani galimoto yanu" },
  nav_brands: { en: "Brands & classics", ny: "Mitundu ndi zakale" },
  nav_lookup: { en: "Car lookup", ny: "Funsani za galimoto" },
  nav_login: { en: "Log in", ny: "Lowani" },
  nav_admin: { en: "Admin", ny: "Oyang'anira" },
  search_placeholder: { en: "Search…", ny: "Sakani…" },

  footer_marketplace: { en: "Marketplace", ny: "Malo ogulitsira" },
  footer_tools: { en: "Tools", ny: "Zida" },
  footer_company: { en: "Company", ny: "Kampani" },
  footer_become_seller: { en: "Become a seller", ny: "Khalani wogulitsa" },
  footer_brand_catalogue: { en: "Brand catalogue", ny: "Mndandanda wa mitundu" },
  footer_safety_guide: { en: "Safety guide", ny: "Chitsogozo cha chitetezo" },
  footer_blog: { en: "Blog", ny: "Blog" },
  footer_tagline_default: {
    en: "Malawi's online home for cars. Look up, buy, sell and explore.",
    ny: "Nyumba ya pa intaneti ya magalimoto ku Malawi. Funsani, gulani, gulitsani ndi kufufuza.",
  },
  footer_made_in_malawi: { en: "Made in Malawi", ny: "Yopangidwa ku Malawi" },

  language_section_title: { en: "Select Language", ny: "Sankhani Chinenero" },
  language_option_en: { en: "English", ny: "English" },
  language_option_ny: { en: "Chichewa (Chinyanja)", ny: "Chichewa (Chinyanja)" },
  language_option_both: { en: "English & Chichewa (Bilingual)", ny: "English & Chichewa (Ziwiri)" },
} as const;

export type TranslationKey = keyof typeof translations;

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return value === "ny" || value === "both" ? value : "en";
}

/** Plain-string lookup for compact UI (nav items, buttons). Bilingual mode joins with " / ". */
export function t(lang: Lang, key: TranslationKey): string {
  const entry = translations[key];
  if (lang === "ny") return entry.ny;
  if (lang === "both") return `${entry.en} / ${entry.ny}`;
  return entry.en;
}
