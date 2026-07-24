import { NextResponse } from "next/server";
import { z } from "zod";
import { requireManager } from "@/lib/auth";
import { updateSellerSharingSettings } from "@/lib/sellerSharingSettings";

const patchSchema = z.object({ enabled: z.boolean() });

/**
 * Managers may only flip the global master switch — the rest of the
 * seller-sharing configuration (social platforms, SEO, security, ...) stays
 * Developer Panel-only, reached via /api/developer/seller-sharing/settings.
 */
export async function PATCH(req: Request) {
  let manager;
  try {
    manager = await requireManager();
  } catch {
    return NextResponse.json({ error: "Manager access required." }, { status: 403 });
  }

  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const settings = await updateSellerSharingSettings({ enabled: parsed.data.enabled }, manager.id);
  return NextResponse.json({ settings });
}
