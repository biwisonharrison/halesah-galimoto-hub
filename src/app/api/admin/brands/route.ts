import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

const bodySchema = z.object({
  name: z.string().min(1),
  originCountry: z.string().min(1),
  history: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Fill in name, origin and history." }, { status: 400 });

  const brand = await prisma.brand.create({
    data: { ...parsed.data, slug: slugify(parsed.data.name) },
  });

  return NextResponse.json({ brand });
}
