import { phoneKey } from "@/lib/phone-links";
import type { Customer, InboxThread, Message } from "@/lib/types";

export function buildThreads(
  messages: Message[],
  customers: Pick<Customer, "id" | "name" | "phone_number">[],
): InboxThread[] {
  const byPhone = new Map<string, Message[]>();
  for (const message of messages) {
    const key = phoneKey(message.phone_number);
    const list = byPhone.get(key) ?? [];
    list.push(message);
    byPhone.set(key, list);
  }

  const threads: InboxThread[] = [];
  for (const [phone_number, list] of byPhone) {
    const sorted = [...list].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const last = sorted[0];
    const customer =
      customers.find((row) => phoneKey(row.phone_number) === phone_number) ?? null;
    threads.push({
      phone_number,
      last_body: last.body,
      last_at: last.created_at,
      direction: last.direction,
      customer,
    });
  }

  return threads.sort(
    (a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime(),
  );
}
