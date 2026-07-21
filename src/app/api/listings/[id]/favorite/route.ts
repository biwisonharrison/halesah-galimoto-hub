import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to save cars." }, { status: 401 });

  await prisma.favorite.upsert({
    where: { userId_listingId: { userId: user.id, listingId: params.id } },
    update: {},
    create: { userId: user.id, listingId: params.id },
  });

  return NextResponse.json({ favorited: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in to save cars." }, { status: 401 });

  await prisma.favorite
    .delete({ where: { userId_listingId: { userId: user.id, listingId: params.id } } })
    .catch(() => null);

  return NextResponse.json({ favorited: false });
}
