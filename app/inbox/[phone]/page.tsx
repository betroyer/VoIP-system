import { BrowserCallButton } from "@/components/browser-call-button";
import { CallCenterSetupBanner } from "@/components/call-center-setup-banner";
import { InboxComposer } from "@/components/inbox-composer";
import { InboxRealtime } from "@/components/inbox-realtime";
import { MessageBubble } from "@/components/message-bubble";
import { ThreadList } from "@/components/thread-list";
import { StaffPage, requireStaff } from "@/lib/auth";
import { formatPhone } from "@/lib/format";
import { buildThreads } from "@/lib/inbox";
import { phoneKey } from "@/lib/phone-links";
import {
  getOutboundCallerId,
  isTwilioConfigured,
  isTwilioVoiceConfigured,
} from "@/lib/twilio";
import type { Customer, Message } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function InboxThreadPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone: raw } = await params;
  const phone = phoneKey(raw);
  if (!phone) {
    notFound();
  }

  const session = await requireStaff();

  let threads: ReturnType<typeof buildThreads> = [];
  let messages: Message[] = [];
  let customer: Pick<Customer, "id" | "name" | "phone_number"> | null = null;

  if (session) {
    const [{ data: allMessages, error: messagesError }, { data: customers }] = await Promise.all([
      session.supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1000),
      session.supabase.from("customers").select("id, name, phone_number"),
    ]);

    const list = messagesError ? [] : ((allMessages ?? []) as Message[]);
    const people = (customers ?? []) as Pick<Customer, "id" | "name" | "phone_number">[];
    threads = buildThreads(list, people);
    messages = list.filter((row) => phoneKey(row.phone_number) === phone);
    customer = people.find((row) => phoneKey(row.phone_number) === phone) ?? null;
  }

  const title = customer?.name ?? formatPhone(phone);

  return (
    <StaffPage>
      <InboxRealtime phoneNumber={phone} />
      <div className="mb-4">
        <CallCenterSetupBanner />
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-card shadow-sm lg:grid lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-line lg:block">
          <div className="border-b border-line px-4 py-3 text-sm font-medium">Conversations</div>
          <ThreadList threads={threads} activePhone={phone} />
        </aside>
        <section className="flex min-h-[70vh] flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div>
              <Link href="/inbox" className="text-xs text-accent hover:underline lg:hidden">
                All conversations
              </Link>
              <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
              <p className="font-mono text-sm text-muted">{formatPhone(phone)}</p>
            </div>
            <BrowserCallButton
              customerPhone={phone}
              customerName={customer?.name}
              voiceReady={isTwilioVoiceConfigured()}
              callerIdDisplay={getOutboundCallerId()}
              label="Call"
            />
          </header>
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto bg-background px-4 py-4">
            {messages.length === 0 ? (
              <p className="my-auto text-center text-sm text-muted">
                No messages yet. Send the first one below.
              </p>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}
          </div>
          <InboxComposer phoneNumber={phone} smsReady={isTwilioConfigured()} />
        </section>
      </div>
    </StaffPage>
  );
}
