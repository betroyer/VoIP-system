import { NetworkBadge, StatusBadge } from "@/components/badges";
import { StaffPage, requireStaff } from "@/lib/auth";
import { formatDate, formatPhone } from "@/lib/format";
import type { OrderWithCustomer } from "@/lib/types";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await requireStaff();
  const orders = session
    ? ((
        await session.supabase
          .from("orders")
          .select("*, customers (*), contact_logs (id)")
          .order("updated_at", { ascending: false })
      ).data ?? []) as OrderWithCustomer[]
    : [];

  return (
    <StaffPage>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-muted">
            Parcel status for every order, including completed ones.
          </p>
        </div>
        <Link
          href="/orders/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          New order
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-card p-8 text-sm text-muted">
          No orders yet.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-card shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
                      {order.customers.name}
                    </Link>
                    <div className="mt-1">
                      <NetworkBadge value={order.customers.network} />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {formatPhone(order.customers.phone_number)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={order.parcel_status} />
                  </td>
                  <td className="px-4 py-3">
                    {order.needs_contact ? (
                      <span className="text-amber-800">Needs contact</span>
                    ) : (
                      <span className="text-muted">Done</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(order.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </StaffPage>
  );
}
