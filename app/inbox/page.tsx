import { CallCenterSetupBanner } from "@/components/call-center-setup-banner";
import { InboxRealtime } from "@/components/inbox-realtime";
import { ThreadList } from "@/components/thread-list";
import { StaffPage, requireStaff } from "@/lib/auth";
import { buildThreads } from "@/lib/inbox";
import type { Customer, Message } from "@/lib/types";

export default async function InboxPage() {
  const session = await requireStaff();

  let threads: ReturnType<typeof buildThreads> = [];
  let messagesMissing = false;
  if (session) {
    const [{ data: messages, error: messagesError }, { data: customers }] = await Promise.all([
      session.supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      session.supabase.from("customers").select("id, name, phone_number"),
    ]);
    if (messagesError) {
      messagesMissing = true;
    } else {
      threads = buildThreads(
        (messages ?? []) as Message[],
        (customers ?? []) as Pick<Customer, "id" | "name" | "phone_number">[],
      );
    }
  }

  return (
    <StaffPage>
      <InboxRealtime />
      <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
      <p className="mt-1 text-sm text-muted">
        Message customers from this PC through the SIM gateway. Open a thread to call
        them.
      </p>
      <div className="mt-5">
        <CallCenterSetupBanner />
      </div>
      {messagesMissing ? (
        <p className="mt-4 rounded-lg border border-danger/30 bg-red-50 px-3 py-2 text-sm text-danger">
          Inbox table is missing. Run <code>supabase/messages.sql</code> in the Supabase SQL editor.
        </p>
      ) : null}
      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-card shadow-sm">
        <ThreadList threads={threads} />
      </div>
    </StaffPage>
  );
}
