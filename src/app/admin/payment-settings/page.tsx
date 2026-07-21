import { prisma } from "@/lib/prisma";
import AdminPaymentMethods from "@/components/AdminPaymentMethods";

export default async function AdminPaymentSettingsPage() {
  const methods = await prisma.paymentMethod.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }] });

  return (
    <div>
      <p className="mb-6 text-sm text-gray-600">
        Changes here appear immediately on the seller payment page.
      </p>
      <AdminPaymentMethods methods={methods} />
    </div>
  );
}
