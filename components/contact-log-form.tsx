import { ActionForm } from "@/components/action-form";
import { CALL_OUTCOMES, CONTACT_TYPES, PARCEL_STATUSES, SMS_OUTCOMES } from "@/lib/constants";
import { logContact } from "@/lib/actions";
import type { ParcelStatus } from "@/lib/types";
import { FormButton } from "@/components/form-button";
import { OutcomeFields } from "@/components/outcome-fields";

export function ContactLogForm({
  orderId,
  currentStatus,
  compact = false,
}: {
  orderId: string;
  currentStatus: ParcelStatus;
  compact?: boolean;
}) {
  return (
    <ActionForm action={logContact} className="grid gap-3">
      <input type="hidden" name="order_id" value={orderId} />
      <OutcomeFields
        contactTypes={CONTACT_TYPES}
        callOutcomes={CALL_OUTCOMES}
        smsOutcomes={SMS_OUTCOMES}
      />
      <label className="grid gap-1 text-sm">
        Notes
        <textarea
          name="notes"
          rows={compact ? 2 : 3}
          className="rounded-md border border-line bg-white px-3 py-2"
          placeholder="What did the customer say?"
        />
      </label>
      {!compact ? (
        <label className="grid gap-1 text-sm">
          Call recording (optional)
          <input
            type="file"
            name="recording"
            accept="audio/*,.m4a,.mp3,.ogg,.wav,.aac"
            className="rounded-md border border-line bg-white px-3 py-2 text-sm"
          />
        </label>
      ) : null}
      <label className="grid gap-1 text-sm">
        Update parcel status
        <select
          name="parcel_status"
          defaultValue={currentStatus}
          className="rounded-md border border-line bg-white px-3 py-2"
        >
          {PARCEL_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="needs_contact" defaultChecked className="size-4" />
        Still needs contact / follow-up
      </label>
      <FormButton>Save log</FormButton>
    </ActionForm>
  );
}
