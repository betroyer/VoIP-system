import { formatDateTime } from "@/lib/format";
import type { Message } from "@/lib/types";

export function MessageBubble({ message }: { message: Message }) {
  const outbound = message.direction === "outbound";
  return (
    <div className={`flex ${outbound ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
          outbound
            ? "bg-accent text-white"
            : "border border-line bg-white text-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.body}</p>
        <p className={`mt-1 text-[11px] ${outbound ? "text-white/70" : "text-muted"}`}>
          {formatDateTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
