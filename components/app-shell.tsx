import { signOut } from "@/lib/actions";
import { BusinessPhoneBanner } from "@/components/business-phone-banner";
import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/", label: "Queue" },
  { href: "/contact", label: "Contact" },
  { href: "/inbox", label: "Inbox" },
  { href: "/orders", label: "Orders" },
  { href: "/customers", label: "Customers" },
  { href: "/logs", label: "Logs" },
];

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-full">
      <header className="border-b border-line bg-[#102422] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-3">
          <Link href="/" className="mr-2 font-semibold tracking-tight">
            Customer Contact
          </Link>
          <nav className="flex flex-1 flex-wrap gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-sm text-white/80 hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <BusinessPhoneBanner compact />
            <span className="hidden sm:inline">{email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-white/20 px-3 py-1.5 text-white hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
