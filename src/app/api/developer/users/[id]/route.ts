import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDeveloper } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ROLE_VALUES = ["BUYER", "DEALER", "ADMIN", "DEVELOPER", "MANAGER", "SALES_AGENT", "MODERATOR"] as const;

const bodySchema = z.object({
  role: z.enum(ROLE_VALUES).optional(),
  name: z.string().trim().min(1).max(100).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the fields you're updating." }, { status: 400 });
  }

  if (params.id === developer.id && (parsed.data.role || parsed.data.active === false)) {
    return NextResponse.json({ error: "You can't change your own role or deactivate your own account." }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id: params.id }, data: parsed.data }).catch(() => null);
  if (!user) {
    return NextResponse.json({ error: "That user could not be found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  let developer;
  try {
    developer = await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  if (params.id === developer.id) {
    return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  }

  const [listingCount, convoCount, reviewCount, sellerAccount] = await Promise.all([
    prisma.listing.count({ where: { sellerId: params.id } }),
    prisma.conversation.count({ where: { OR: [{ buyerId: params.id }, { sellerId: params.id }] } }),
    prisma.review.count({ where: { OR: [{ authorId: params.id }, { subjectId: params.id }] } }),
    prisma.sellerAccount.findUnique({ where: { userId: params.id } }),
  ]);

  if (listingCount > 0 || convoCount > 0 || reviewCount > 0 || sellerAccount) {
    return NextResponse.json(
      { error: "This account has listings, messages, or seller history — deactivate it instead of deleting to keep marketplace records intact." },
      { status: 409 }
    );
  }

  await prisma.user.delete({ where: { id: params.id } }).catch(() => null);
  return NextResponse.json({ ok: true });
}
