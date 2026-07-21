import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

const bodySchema = z.object({
  brandId: z.string().min(1),
  name: z.string().min(1),
  yearStart: z.number().int(),
  yearEnd: z.number().int().optional(),
  bodyType: z.enum(["SEDAN", "HATCHBACK", "SUV", "PICKUP", "VAN", "MINIBUS", "WAGON", "COUPE", "TRUCK", "MOTORCYCLE"]),
  fuelType: z.enum(["PETROL", "DIESEL", "HYBRID", "ELECTRIC"]),
  drivetrain: z.enum(["TWO_WD", "FOUR_WD", "AWD"]),
  engineCc: z.number().int().optional(),
  seating: z.number().int().optional(),
  description: z.string().optional(),
  isClassic: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check the model details." }, { status: 400 });
  }

  const model = await prisma.carModel.create({
    data: { ...parsed.data, slug: slugify(parsed.data.name) },
  });

  return NextResponse.json({ model });
}
