import { CustomerForm } from "@/components/customer-form";
import { StaffPage } from "@/lib/auth";
import Link from "next/link";

export default function NewCustomerPage() {
  return (
    <StaffPage>
      <Link href="/customers" className="text-sm text-accent hover:underline">
        Back to customers
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">Add customer</h1>
      <div className="mt-6 rounded-xl border border-line bg-card p-5 shadow-sm">
        <CustomerForm />
      </div>
    </StaffPage>
  );
}
