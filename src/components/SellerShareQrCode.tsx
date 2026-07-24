"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function SellerShareQrCode({ url }: { url: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { width: 120, margin: 1 })
      .then((generated) => {
        if (!cancelled) setDataUrl(generated);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (!dataUrl) {
    return <div className="h-[120px] w-[120px] shrink-0 rounded-lg border border-gray-200 bg-gray-100" />;
  }

  // Data URI — next/image's optimizer doesn't apply here, a plain img is correct.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR code linking to your public inventory page" className="h-[120px] w-[120px] shrink-0 rounded-lg border border-gray-200" />;
}
