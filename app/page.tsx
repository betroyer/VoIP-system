import { NetworkBadge, OutcomeBadge, StatusBadge } from "@/components/badges";
import { BusinessPhoneBanner } from "@/components/business-phone-banner";
import { ContactActions } from "@/components/contact-actions";
import { ContactLogForm } from "@/components/contact-log-form";
import { CopyButton } from "@/components/copy-button";
import { DISCLOSURE_SCRIPT } from "@/lib/constants";
import { StaffPage, requireStaff } from "@/lib/auth";
import { getBusinessPhone } from "@/lib/business-phone";
import { formatDateTime, formatPhone, manilaStartOfTodayIso } from "@/lib/format";
import type { OrderWithCustomer } from "@/lib/types";
import Link from "next/link";

export default async function QueuePage() {
  const session = await requireStaff();

  let orders: OrderWithCustomer[] = [];
  let loggedToday = 0;

  if (session) {
    const [{ data }, todayLogs] = await Promise.all([
      session.supabase
        .from("orders")
        .select("*, customers (*), contact_logs (*)")
        .eq("needs_contact", true)
        .order("updated_at", { ascending: true })
        .order("timestamp", { referencedTable: "contact_logs", ascending: false }),
      session.supabase
        .from("contact_logs")
        .select("id", { count: "exact", head: true })
        .gte("timestamp", manilaStartOfTodayIso()),
    ]);

    orders = (data ?? []) as OrderWithCustomer[];
    loggedToday = todayLogs.count ?? 0;
  }

  const noAnswer = orders.filter((order) => {
    const last = order.contact_logs?.[0];
    return last?.outcome === "no_answer" || last?.outcome === "busy";
  }).length;

  return (
    <StaffPage>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Today&apos;s queue</h1>
          <p className="mt-1 text-sm text-muted">
            Call or text from the Android staff app on the business phone (
            {formatPhone(getBusinessPhone())}), then log the outcome here.
          </p>
        </div>
        <Link
          href="/orders/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          New order
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat label="Need contact" value={orders.length} />
        <Stat label="No answer / busy" value={noAnswer} />
        <Stat label="Logged today" value={loggedToday} />
      </div>

      <div className="mt-5">
        <BusinessPhoneBanner />
      </div>

      <aside className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
        <strong>Before you record a call:</strong> {DISCLOSURE_SCRIPT} Required
        under RA 4200.
      </aside>

      {orders.length === 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-card p-8 text-sm text-muted">
          Nobody is waiting for contact. Add an order or mark an existing one as
          needing follow-up.
        </div>
      ) : (
        <ul className="mt-6 grid gap-4">
          {orders.map((order) => {
            const customer = order.customers;
            const last = order.contact_logs?.[0];

            return (
              <li
                key={order.id}
                className="rounded-xl border border-line bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {customer.name}
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="font-mono text-base font-medium">
                        {formatPhone(customer.phone_number)}
                      </span>
                      <CopyButton value={customer.phone_number} />
                      <NetworkBadge value={customer.network} />
                      <StatusBadge value={order.parcel_status} />
                    </div>
                    {customer.address ? (
                      <p className="mt-1 text-sm text-muted">{customer.address}</p>
                    ) : null}
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm text-accent hover:underline"
                  >
                    Open order
                  </Link>
                </div>
                {last ? (
                  <p className="mt-3 text-sm text-muted">
                    Last: <OutcomeBadge value={last.outcome} />{" "}
                    {last.contact_type.toUpperCase()} · {formatDateTime(last.timestamp)}
                    {last.notes ? ` · ${last.notes}` : ""}
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-muted">No contact yet.</p>
                )}
                <div className="mt-4">
                  <ContactActions
                    customerName={customer.name}
                    customerPhone={customer.phone_number}
                    orderId={order.id}
                    parcelStatus={order.parcel_status}
                    trackingNumber={order.tracking_number}
                  />
                </div>
                <details className="mt-4 rounded-lg border border-line bg-background px-3 py-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    Quick-log outcome
                  </summary>
                  <div className="mt-3 pb-2">
                    <ContactLogForm
                      orderId={order.id}
                      currentStatus={order.parcel_status}
                      compact
                    />
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </StaffPage>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-card px-4 py-3 shadow-sm">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
