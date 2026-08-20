import { OrderForm } from "@/components/order-form";
import { StaffPage, requireStaff } from "@/lib/auth";
import type { Customer } from "@/lib/types";
import Link from "next/link";

export default async function NewOrderPage() {
  const session = await requireStaff();
  const customers = session
    ? ((
        await session.supabase
          .from("customers")
          .select("id, name, phone_number")
          .order("name")
      ).data ?? []) as Pick<Customer, "id" | "name" | "phone_number">[]
    : [];

  return (
    <StaffPage>
      <Link href="/orders" className="text-sm text-accent hover:underline">
        Back to orders
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">New order</h1>
      <p className="mt-1 text-sm text-muted">
        New orders start on the contact queue until you log a completed outcome.
      </p>
      <div className="mt-6 rounded-xl border border-line bg-card p-5 shadow-sm">
        {customers.length === 0 ? (
          <p className="text-sm text-muted">
            Add a customer first, then come back to create an order.{" "}
            <Link href="/customers/new" className="text-accent hover:underline">
              Add customer
            </Link>
          </p>
        ) : (
          <OrderForm customers={customers} />
        )}
      </div>
    </StaffPage>
  );
}
