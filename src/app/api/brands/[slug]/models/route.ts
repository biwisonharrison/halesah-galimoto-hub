import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const brand = await prisma.brand.findUnique({ where: { slug: params.slug } });
  if (!brand) return NextResponse.json({ models: [] });

  const models = await prisma.carModel.findMany({
    where: { brandId: brand.id },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      yearStart: true,
      yearEnd: true,
      bodyType: true,
      fuelType: true,
      engineCc: true,
      seating: true,
      drivetrain: true,
    },
  });

  return NextResponse.json({ models });
}
