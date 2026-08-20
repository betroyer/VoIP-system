import { formatDateTime, formatPhone } from "@/lib/format";
import type { InboxThread } from "@/lib/types";
import { inboxPath } from "@/lib/phone-links";
import Link from "next/link";

export function ThreadList({
  threads,
  activePhone,
}: {
  threads: InboxThread[];
  activePhone?: string;
}) {
  if (threads.length === 0) {
    return (
      <p className="px-4 py-8 text-sm text-muted">
        No conversations yet. Dial a number in Contact, then Open inbox, or message a
        customer from the queue.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line">
      {threads.map((thread) => {
        const active = thread.phone_number === activePhone;
        return (
          <li key={thread.phone_number}>
            <Link
              href={inboxPath(thread.phone_number)}
              className={`block px-4 py-3 hover:bg-background ${active ? "bg-background" : ""}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium">
                  {thread.customer?.name ?? formatPhone(thread.phone_number)}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {formatDateTime(thread.last_at)}
                </span>
              </div>
              {thread.customer ? (
                <p className="font-mono text-xs text-muted">
                  {formatPhone(thread.phone_number)}
                </p>
              ) : null}
              <p className="mt-1 truncate text-sm text-muted">{thread.last_body}</p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
