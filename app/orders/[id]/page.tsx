import { NetworkBadge, OutcomeBadge, StatusBadge } from "@/components/badges";
import { ContactActions } from "@/components/contact-actions";
import { ContactLogForm } from "@/components/contact-log-form";
import { CopyButton } from "@/components/copy-button";
import { OrderForm } from "@/components/order-form";
import { DISCLOSURE_SCRIPT } from "@/lib/constants";
import { StaffPage, requireStaff } from "@/lib/auth";
import { formatDateTime, formatPhone, labelContactType } from "@/lib/format";
import type { ContactLog, Customer, OrderWithCustomer } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireStaff();

  if (!session) {
    return (
      <StaffPage>
        <div />
      </StaffPage>
    );
  }

  const [{ data: order }, { data: customers }] = await Promise.all([
    session.supabase
      .from("orders")
      .select("*, customers (*), contact_logs (*)")
      .eq("id", id)
      .order("timestamp", { referencedTable: "contact_logs", ascending: false })
      .maybeSingle(),
    session.supabase.from("customers").select("id, name, phone_number").order("name"),
  ]);

  if (!order) {
    notFound();
  }

  const record = order as OrderWithCustomer;
  const customer = record.customers;
  const logs = (record.contact_logs ?? []) as ContactLog[];

  const recordingLinks = await Promise.all(
    logs.map(async (log) => {
      if (!log.recording_link) return null;
      const { data } = await session.supabase.storage
        .from("call-recordings")
        .createSignedUrl(log.recording_link, 60 * 60);
      return data?.signedUrl ?? null;
    }),
  );

  return (
    <StaffPage>
      <Link href="/orders" className="text-sm text-accent hover:underline">
        Back to orders
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{customer.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <a href={`tel:${customer.phone_number}`} className="font-mono text-lg font-medium">
              {formatPhone(customer.phone_number)}
            </a>
            <CopyButton value={customer.phone_number} />
            <NetworkBadge value={customer.network} />
            <StatusBadge value={record.parcel_status} />
          </div>
          {customer.address ? (
            <p className="mt-2 text-sm text-muted">{customer.address}</p>
          ) : null}
        </div>
      </div>

      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        {DISCLOSURE_SCRIPT}
      </p>

      <section className="mt-6 rounded-xl border border-line bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Contact customer</h2>
        <p className="mt-1 text-sm text-muted">
          Call or message using the business phone, then save the outcome below.
        </p>
        <div className="mt-4">
          <ContactActions
            customerName={customer.name}
            customerPhone={customer.phone_number}
            orderId={record.id}
            parcelStatus={record.parcel_status}
            trackingNumber={record.tracking_number}
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border border-line bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Log call or SMS</h2>
          <p className="mt-1 text-sm text-muted">
            After the call or text, record what happened.
          </p>
          <div className="mt-4">
            <ContactLogForm orderId={record.id} currentStatus={record.parcel_status} />
          </div>
        </section>

        <section className="rounded-xl border border-line bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Order details</h2>
          <div className="mt-4">
            <OrderForm
              customers={(customers ?? []) as Pick<Customer, "id" | "name" | "phone_number">[]}
              order={record}
            />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-line bg-card p-5 shadow-sm">
        <h2 className="font-semibold">Contact history</h2>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No attempts yet.</p>
        ) : (
          <ol className="mt-4 grid gap-3">
            {logs.map((log, index) => (
              <li key={log.id} className="rounded-lg border border-line bg-background px-3 py-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{labelContactType(log.contact_type)}</span>
                  <OutcomeBadge value={log.outcome} />
                  <span className="text-muted">{formatDateTime(log.timestamp)}</span>
                </div>
                {log.notes ? <p className="mt-2 text-sm">{log.notes}</p> : null}
                {recordingLinks[index] ? (
                  <audio className="mt-3 w-full" controls src={recordingLinks[index] ?? undefined} />
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </StaffPage>
  );
}
