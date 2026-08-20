import { NetworkBadge, OutcomeBadge } from "@/components/badges";
import { StaffPage, requireStaff } from "@/lib/auth";
import { formatDateTime, formatPhone, labelContactType } from "@/lib/format";
import type { ContactLogWithRelations } from "@/lib/types";
import Link from "next/link";

export default async function LogsPage() {
  const session = await requireStaff();
  const logs = session
    ? ((
        await session.supabase
          .from("contact_logs")
          .select(
            "*, orders (id, parcel_status, tracking_number, customers (id, name, phone_number, network)), staff (id, name, email)",
          )
          .order("timestamp", { ascending: false })
          .limit(100)
      ).data ?? []) as ContactLogWithRelations[]
    : [];

  return (
    <StaffPage>
      <h1 className="text-2xl font-semibold tracking-tight">Contact logs</h1>
      <p className="mt-1 text-sm text-muted">
        Every call and SMS attempt, including no-answer follow-ups.
      </p>

      {logs.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-card p-8 text-sm text-muted">
          No logs yet. Outcomes saved from the queue will show up here.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-card shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-line bg-background text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-line last:border-0 align-top">
                  <td className="px-4 py-3 whitespace-nowrap text-muted">
                    {formatDateTime(log.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/orders/${log.order_id}`} className="font-medium hover:underline">
                      {log.orders.customers.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs">
                        {formatPhone(log.orders.customers.phone_number)}
                      </span>
                      <NetworkBadge value={log.orders.customers.network} />
                    </div>
                  </td>
                  <td className="px-4 py-3">{labelContactType(log.contact_type)}</td>
                  <td className="px-4 py-3">
                    <OutcomeBadge value={log.outcome} />
                  </td>
                  <td className="px-4 py-3 text-muted">{log.staff?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{log.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </StaffPage>
  );
}
