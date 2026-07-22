import "server-only";
import { prisma } from "@/lib/prisma";

export async function recordOtpAudit(params: {
  actorId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string | null;
}) {
  await prisma.otpAuditLog
    .create({
      data: {
        actorId: params.actorId ?? undefined,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        details: params.details,
        ipAddress: params.ipAddress ?? undefined,
      },
    })
    .catch(() => null);
}
