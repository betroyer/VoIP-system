import { ActionForm } from "@/components/action-form";
import { FormButton } from "@/components/form-button";
import { NETWORKS } from "@/lib/constants";
import { createCustomer } from "@/lib/actions";

export function CustomerForm() {
  return (
    <ActionForm action={createCustomer} className="grid max-w-lg gap-3">
      <label className="grid gap-1 text-sm">
        Name
        <input
          name="name"
          required
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Phone number
        <input
          name="phone_number"
          required
          placeholder="09XXXXXXXXX"
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Network
        <select name="network" className="rounded-md border border-line bg-white px-3 py-2">
          {NETWORKS.map((network) => (
            <option key={network.value} value={network.value}>
              {network.label}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        Address
        <textarea
          name="address"
          rows={3}
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <FormButton>Save customer</FormButton>
    </ActionForm>
  );
}
