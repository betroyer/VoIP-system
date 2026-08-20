import { labelNetwork, labelOutcome, labelStatus } from "@/lib/format";
import type { ContactOutcome, Network, ParcelStatus } from "@/lib/types";

const statusClass: Record<ParcelStatus, string> = {
  pending: "bg-amber-100 text-amber-900",
  packed: "bg-orange-100 text-orange-900",
  in_transit: "bg-sky-100 text-sky-900",
  out_for_delivery: "bg-indigo-100 text-indigo-900",
  awaiting_customer: "bg-violet-100 text-violet-900",
  delayed: "bg-red-100 text-red-800",
  delivered: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-stone-200 text-stone-700",
};

const networkClass: Record<Network, string> = {
  tnt: "bg-red-100 text-red-800",
  smart: "bg-blue-100 text-blue-800",
  globe: "bg-teal-100 text-teal-800",
  other: "bg-stone-200 text-stone-700",
};

const outcomeClass: Record<ContactOutcome, string> = {
  answered: "bg-emerald-100 text-emerald-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  sent: "bg-emerald-100 text-emerald-900",
  no_answer: "bg-amber-100 text-amber-900",
  busy: "bg-amber-100 text-amber-900",
  failed: "bg-red-100 text-red-800",
  declined: "bg-red-100 text-red-800",
  wrong_number: "bg-red-100 text-red-800",
};

export function StatusBadge({ value }: { value: ParcelStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClass[value]}`}
    >
      {labelStatus(value)}
    </span>
  );
}

export function NetworkBadge({ value }: { value: Network }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${networkClass[value]}`}
    >
      {labelNetwork(value)}
    </span>
  );
}

export function OutcomeBadge({ value }: { value: ContactOutcome }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${outcomeClass[value]}`}
    >
      {labelOutcome(value)}
    </span>
  );
}
