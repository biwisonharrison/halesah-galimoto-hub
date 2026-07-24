"use client";

import { useState } from "react";
import { trackSellerShareEvent } from "@/lib/sellerShareTrack";

export default function SellerShareCopyButton({ slug, url }: { slug: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url).catch(() => {});
    trackSellerShareEvent(slug, "share_click");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-ink hover:bg-gray-50"
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}
