import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readTrustedDeviceCookie, hashDeviceToken, clearTrustedDeviceCookie } from "@/lib/deviceFingerprint";

export async function GET() {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const [devices, currentToken] = await Promise.all([
    prisma.trustedDevice.findMany({
      where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { lastActiveAt: "desc" },
    }),
    readTrustedDeviceCookie(),
  ]);
  const currentHash = currentToken ? hashDeviceToken(currentToken) : null;

  return NextResponse.json({
    devices: devices.map((d) => ({
      id: d.id,
      label: d.label,
      browser: d.browser,
      os: d.os,
      ipAddress: d.ipAddress,
      lastActiveAt: d.lastActiveAt,
      createdAt: d.createdAt,
      expiresAt: d.expiresAt,
      isCurrent: d.tokenHash === currentHash,
    })),
  });
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const all = searchParams.get("all") === "true";

  if (all) {
    await prisma.trustedDevice.updateMany({ where: { userId: user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    await clearTrustedDeviceCookie();
    return NextResponse.json({ ok: true });
  }

  if (!id) return NextResponse.json({ error: "Specify a device id." }, { status: 400 });

  const device = await prisma.trustedDevice.findUnique({ where: { id } });
  if (!device || device.userId !== user.id) return NextResponse.json({ error: "Device not found." }, { status: 404 });

  await prisma.trustedDevice.update({ where: { id }, data: { revokedAt: new Date() } });

  const currentToken = await readTrustedDeviceCookie();
  if (currentToken && hashDeviceToken(currentToken) === device.tokenHash) {
    await clearTrustedDeviceCookie();
  }

  return NextResponse.json({ ok: true });
}
