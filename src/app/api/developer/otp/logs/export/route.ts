import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireDeveloper } from "@/lib/auth";

function toCsvRow(values: (string | number | null | undefined)[]): string {
  return values
    .map((v) => {
      const s = v === null || v === undefined ? "" : String(v);
      return `"${s.replace(/"/g, '""')}"`;
    })
    .join(",");
}

export async function GET(req: NextRequest) {
  try {
    await requireDeveloper();
  } catch {
    return NextResponse.json({ error: "Developer access required." }, { status: 403 });
  }

  const logs = await prisma.otpDeliveryLog.findMany({ orderBy: { createdAt: "desc" }, take: 5000 });

  const header = toCsvRow([
    "createdAt",
    "purpose",
    "channel",
    "destination",
    "providerKey",
    "status",
    "responseTimeMs",
    "errorMessage",
    "ipAddress",
    "userAgent",
  ]);
  const rows = logs.map((log) =>
    toCsvRow([
      log.createdAt.toISOString(),
      log.purpose,
      log.channel,
      log.destination,
      log.providerKey,
      log.status,
      log.responseTimeMs,
      log.errorMessage,
      log.ipAddress,
      log.userAgent,
    ])
  );

  const csv = [header, ...rows].join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="otp-delivery-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
