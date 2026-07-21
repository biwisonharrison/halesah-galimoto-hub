"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Section = {
  id: string;
  key: string;
  label: string;
  enabled: boolean;
  title: string;
  subtitle: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  locked: boolean;
};

export default function HomepageSectionsEditor({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          isFirst={index === 0}
          isLast={index === sections.length - 1}
        />
      ))}
    </div>
  );
}

function SectionCard({ section, isFirst, isLast }: { section: Section; isFirst: boolean; isLast: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState(section.title);
  const [subtitle, setSubtitle] = useState(section.subtitle);
  const [ctaLabel, setCtaLabel] = useState(section.ctaLabel ?? "");
  const [ctaHref, setCtaHref] = useState(section.ctaHref ?? "");
  const [saving, setSaving] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/developer/homepage/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save.");
      return false;
    }
    return true;
  }

  async function handleToggle() {
    setError(null);
    const ok = await patch({ enabled: !section.enabled });
    if (ok) router.refresh();
  }

  async function handleSaveContent() {
    setSaving(true);
    setError(null);
    const ok = await patch({
      title,
      subtitle,
      ctaLabel: section.ctaLabel === null ? null : ctaLabel,
      ctaHref: section.ctaHref === null ? null : ctaHref,
    });
    setSaving(false);
    if (ok) router.refresh();
  }

  async function handleMove(direction: "up" | "down") {
    setMoving(true);
    setError(null);
    const res = await fetch(`/api/developer/homepage/${section.id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    setMoving(false);
    if (res.ok) router.refresh();
  }

  const hasCta = section.ctaLabel !== null;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white">{section.label}</span>
          {section.locked && (
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">Always shown</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!section.locked && (
            <>
              <button
                onClick={() => handleMove("up")}
                disabled={isFirst || moving}
                className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-40"
              >
                ↑ Up
              </button>
              <button
                onClick={() => handleMove("down")}
                disabled={isLast || moving}
                className="rounded-lg border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800 disabled:opacity-40"
              >
                ↓ Down
              </button>
              <button
                onClick={handleToggle}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                  section.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-400"
                }`}
              >
                {section.enabled ? "Enabled" : "Disabled"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-400">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-white"
            maxLength={160}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-gray-400">Subtitle</span>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-white"
            maxLength={300}
          />
        </label>
        {hasCta && (
          <>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-400">Button label</span>
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-white"
                maxLength={60}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-400">Button link</span>
              <input
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-1.5 text-sm text-white"
                maxLength={300}
              />
            </label>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSaveContent}
        disabled={saving}
        className="mt-3 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-gray-950 hover:bg-emerald-400 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save content"}
      </button>
    </div>
  );
}
