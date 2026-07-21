import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { updateHomepageSection } from "@/lib/homepageSections";

const bodySchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().trim().max(160).optional(),
  subtitle: z.string().trim().max(300).optional(),
  ctaLabel: z.string().trim().max(60).nullable().optional(),
  ctaHref: z.string().trim().max(300).nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the section fields." }, { status: 400 });
  }

  const section = await updateHomepageSection(params.id, parsed.data).catch(() => null);
  if (!section) {
    return NextResponse.json({ error: "That section could not be found." }, { status: 404 });
  }

  return NextResponse.json({ section });
}
