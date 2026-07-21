import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { moveHomepageSection } from "@/lib/homepageSections";

const bodySchema = z.object({ direction: z.enum(["up", "down"]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid direction." }, { status: 400 });
  }

  await moveHomepageSection(params.id, parsed.data.direction);
  return NextResponse.json({ ok: true });
}
