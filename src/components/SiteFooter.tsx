import Link from "next/link";
import { getSiteSettings } from "@/lib/siteSettings";
import { getLang, t } from "@/lib/i18n";
import Bilingual from "./Bilingual";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function SiteFooter() {
  const [settings, lang] = await Promise.all([getSiteSettings(), getLang()]);

  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-600">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-5">
          <div>
            <h3 className="mb-3 font-semibold text-ink">{settings.siteName}</h3>
            <p>{settings.tagline || <Bilingual lang={lang} k="footer_tagline_default" />}</p>
            {settings.contactPhone && <p className="mt-2 text-xs text-gray-400">{settings.contactPhone}</p>}
            {settings.contactEmail && <p className="text-xs text-gray-400">{settings.contactEmail}</p>}
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-ink">{t(lang, "footer_marketplace")}</h3>
            <ul className="space-y-2">
              <li><Link href="/marketplace" className="hover:text-ink">{t(lang, "nav_buy")}</Link></li>
              <li><Link href="/sell" className="hover:text-ink">{t(lang, "nav_sell")}</Link></li>
              <li><Link href="/become-a-seller" className="hover:text-ink">{t(lang, "footer_become_seller")}</Link></li>
              <li><Link href="/brands" className="hover:text-ink">{t(lang, "footer_brand_catalogue")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-ink">{t(lang, "footer_tools")}</h3>
            <ul className="space-y-2">
              <li><Link href="/lookup" className="hover:text-ink">{t(lang, "nav_lookup")}</Link></li>
              <li><Link href="/safety-guide" className="hover:text-ink">{t(lang, "footer_safety_guide")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 font-semibold text-ink">{t(lang, "footer_company")}</h3>
            <ul className="space-y-2">
              <li><Link href="/blog" className="hover:text-ink">{t(lang, "footer_blog")}</Link></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <LanguageSwitcher current={lang} title={t(lang, "language_section_title")} />
          </div>
        </div>
        <p className="mt-8 border-t border-gray-100 pt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} {settings.siteName} · {t(lang, "footer_made_in_malawi")}
        </p>
      </div>
    </footer>
  );
}
