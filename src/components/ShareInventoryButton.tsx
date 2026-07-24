"use client";

import { useEffect, useRef, useState } from "react";
import { trackSellerShareEvent } from "@/lib/sellerShareTrack";

export interface ShareChannelsAllowed {
  allowCopyLink: boolean;
  allowWhatsappShare: boolean;
  allowFacebookShare: boolean;
  allowTwitterShare: boolean;
  allowTelegramShare: boolean;
  allowEmailShare: boolean;
  allowNativeShare: boolean;
}

export default function ShareInventoryButton({
  slug,
  url,
  businessName,
  allowed,
  label = "Share Inventory",
  className,
}: {
  slug: string;
  url: string;
  businessName: string;
  allowed: ShareChannelsAllowed;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const shareText = `Check out ${businessName}'s vehicles for sale`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  function track() {
    trackSellerShareEvent(slug, "share_click");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url).catch(() => {});
    track();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function nativeShare() {
    track();
    await navigator.share({ title: businessName, text: shareText, url }).catch(() => {});
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={className ?? "rounded-lg bg-ink px-5 py-2.5 font-semibold text-white hover:bg-ink/90"}
      >
        {label}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          {allowed.allowCopyLink && (
            <button
              type="button"
              onClick={copyLink}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          )}
          {allowed.allowWhatsappShare && (
            <a
              href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              onClick={track}
              className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-gray-50"
            >
              Share via WhatsApp
            </a>
          )}
          {allowed.allowFacebookShare && (
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
              target="_blank"
              rel="noreferrer"
              onClick={track}
              className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-gray-50"
            >
              Share via Facebook
            </a>
          )}
          {allowed.allowTwitterShare && (
            <a
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`}
              target="_blank"
              rel="noreferrer"
              onClick={track}
              className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-gray-50"
            >
              Share via X (Twitter)
            </a>
          )}
          {allowed.allowTelegramShare && (
            <a
              href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
              target="_blank"
              rel="noreferrer"
              onClick={track}
              className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-gray-50"
            >
              Share via Telegram
            </a>
          )}
          {allowed.allowEmailShare && (
            <a
              href={`mailto:?subject=${encodeURIComponent(`${businessName} — vehicles for sale`)}&body=${encodedText}%20${encodedUrl}`}
              onClick={track}
              className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-gray-50"
            >
              Share via Email
            </a>
          )}
          {allowed.allowNativeShare && hasNativeShare && (
            <button
              type="button"
              onClick={nativeShare}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-gray-50"
            >
              More sharing options…
            </button>
          )}
        </div>
      )}
    </div>
  );
}
