import { prisma } from "@/lib/prisma";
import AdminPlans from "@/components/AdminPlans";

export default async function AdminPlansPage() {
  const plans = await prisma.subscriptionPlan.findMany({ orderBy: { priceMwk: "asc" } });
  return <AdminPlans plans={plans} />;
}
