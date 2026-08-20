import { ActionForm } from "@/components/action-form";
import { FormButton } from "@/components/form-button";
import { PARCEL_STATUSES } from "@/lib/constants";
import { createOrder, updateOrder } from "@/lib/actions";
import type { Customer, Order } from "@/lib/types";

export function OrderForm({
  customers,
  order,
}: {
  customers: Pick<Customer, "id" | "name" | "phone_number">[];
  order?: Pick<
    Order,
    "id" | "customer_id" | "parcel_status" | "tracking_number" | "notes" | "needs_contact"
  >;
}) {
  const isEdit = Boolean(order);

  return (
    <ActionForm
      action={isEdit ? updateOrder : createOrder}
      className="grid max-w-lg gap-3"
    >
      {order ? <input type="hidden" name="order_id" value={order.id} /> : null}
      <label className="grid gap-1 text-sm">
        Customer
        <select
          name="customer_id"
          required
          disabled={isEdit}
          defaultValue={order?.customer_id}
          className="rounded-md border border-line bg-white px-3 py-2 disabled:bg-background"
        >
          <option value="">Select customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} · {customer.phone_number}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Parcel status
        <select
          name="parcel_status"
          defaultValue={order?.parcel_status ?? "pending"}
          className="rounded-md border border-line bg-white px-3 py-2"
        >
          {PARCEL_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Tracking number
        <input
          name="tracking_number"
          defaultValue={order?.tracking_number ?? ""}
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Notes
        <textarea
          name="notes"
          rows={3}
          defaultValue={order?.notes ?? ""}
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="needs_contact"
          defaultChecked={order?.needs_contact ?? true}
          className="size-4"
        />
        Needs contact
      </label>
      <FormButton>{isEdit ? "Save changes" : "Create order"}</FormButton>
    </ActionForm>
  );
}
