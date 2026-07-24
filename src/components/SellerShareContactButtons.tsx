"use client";

import { trackSellerShareEvent } from "@/lib/sellerShareTrack";

export default function SellerShareContactButtons({
  slug,
  businessName,
  callPhoneNumber,
  whatsappNumber,
}: {
  slug: string;
  businessName: string;
  callPhoneNumber: string | null;
  whatsappNumber: string | null;
}) {
  if (!callPhoneNumber && !whatsappNumber) return null;

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace("+", "")}?text=${encodeURIComponent(
        `Hi, I saw your inventory for ${businessName} on Halesah Galimoto Hub, is a car still available?`
      )}`
    : null;

  return (
    <div className="flex gap-2">
      {callPhoneNumber && (
        <a
          href={`tel:${callPhoneNumber}`}
          onClick={() => trackSellerShareEvent(slug, "phone_click")}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-gray-50"
        >
          Call
        </a>
      )}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          onClick={() => trackSellerShareEvent(slug, "whatsapp_click")}
          className="flex-1 rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-700"
        >
          WhatsApp
        </a>
      )}
    </div>
  );
}
