import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const bodySchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  // Best-effort analytics logging: never let a tracking failure break the page.
  try {
    const user = await getCurrentUser().catch(() => null);
    await prisma.pageView.create({
      data: {
        path: parsed.data.path,
        referrer: parsed.data.referrer,
        userId: user?.id,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });
  } catch {
    // swallow: analytics must never break navigation
  }

  return NextResponse.json({ ok: true });
}
