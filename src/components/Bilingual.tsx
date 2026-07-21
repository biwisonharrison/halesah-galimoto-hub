import { translations, type Lang, type TranslationKey } from "@/lib/i18n";

/** Renders a translation key as a block: English on its own line, Chichewa below it in "both" mode. */
export default function Bilingual({
  lang,
  k,
  subClassName = "mt-0.5 block text-[0.85em] font-normal opacity-70",
}: {
  lang: Lang;
  k: TranslationKey;
  subClassName?: string;
}) {
  const entry = translations[k];
  if (lang === "ny") return <>{entry.ny}</>;
  if (lang === "both") {
    return (
      <>
        {entry.en}
        <span className={subClassName}>{entry.ny}</span>
      </>
    );
  }
  return <>{entry.en}</>;
}
