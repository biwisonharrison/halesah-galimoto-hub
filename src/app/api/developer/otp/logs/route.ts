import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDeveloper } from "@/lib/auth";
import type { Prisma, OtpDeliveryStatus, OtpPurpose } from "@prisma/client";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "delivery";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const status = searchParams.get("status") || undefined;
  const providerKey = searchParams.get("providerKey") || undefined;
  const purpose = (searchParams.get("purpose") as OtpPurpose | null) || undefined;
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;
  const dateFilter = from || to ? { gte: from, lte: to } : undefined;

  if (type === "verification") {
    const where: Prisma.OtpVerificationLogWhereInput = {
      purpose,
      success: status ? status === "SUCCESS" : undefined,
      createdAt: dateFilter,
    };
    const [logs, totalCount] = await Promise.all([
      prisma.otpVerificationLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
      prisma.otpVerificationLog.count({ where }),
    ]);
    return NextResponse.json({ logs, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), page });
  }

  if (type === "audit") {
    const [logs, totalCount] = await Promise.all([
      prisma.otpAuditLog.findMany({
        include: { actor: { select: { name: true, phone: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.otpAuditLog.count(),
    ]);
    return NextResponse.json({ logs, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), page });
  }

  const where: Prisma.OtpDeliveryLogWhereInput = {
    status: (status as OtpDeliveryStatus | undefined) || undefined,
    providerKey: providerKey || undefined,
    purpose,
    createdAt: dateFilter,
  };
  const [logs, totalCount] = await Promise.all([
    prisma.otpDeliveryLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.otpDeliveryLog.count({ where }),
  ]);
  return NextResponse.json({ logs, totalCount, totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)), page });
}
