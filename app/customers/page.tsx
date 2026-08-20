import { NetworkBadge } from "@/components/badges";
import { StaffPage, requireStaff } from "@/lib/auth";
import { formatPhone } from "@/lib/format";
import type { Customer } from "@/lib/types";
import Link from "next/link";

export default async function CustomersPage() {
  const session = await requireStaff();
  const customers = session
    ? ((
        await session.supabase
          .from("customers")
          .select("*")
          .order("created_at", { ascending: false })
      ).data ?? []) as Customer[]
    : [];

  return (
    <StaffPage>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-muted">
            Names, numbers, and networks for parcel contact.
          </p>
        </div>
        <Link
          href="/customers/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Add customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-card p-8 text-sm text-muted">
          No customers yet. Add the first one to start logging orders.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-card shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Network</th>
                <th className="px-4 py-3 font-medium">Address</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3 font-mono">
                    {formatPhone(customer.phone_number)}
                  </td>
                  <td className="px-4 py-3">
                    <NetworkBadge value={customer.network} />
                  </td>
                  <td className="px-4 py-3 text-muted">{customer.address ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </StaffPage>
  );
}
