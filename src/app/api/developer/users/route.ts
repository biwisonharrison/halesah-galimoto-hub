import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeMalawiPhone } from "@/lib/phone";

const ROLE_VALUES = ["BUYER", "DEALER", "ADMIN", "DEVELOPER", "MANAGER", "SALES_AGENT", "MODERATOR"] as const;

const bodySchema = z.object({
  phone: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  role: z.enum(ROLE_VALUES),
});

export async function POST(req: Request) {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the account details." }, { status: 400 });
  }

  const phone = normalizeMalawiPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid Malawian phone number." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return NextResponse.json({ error: "A user with that phone number already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: { phone, name: parsed.data.name, role: parsed.data.role, phoneVerifiedAt: new Date() },
  });

  return NextResponse.json({ user });
}
