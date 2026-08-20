import { LoginForm } from "@/components/login-form";
import { SetupNotice } from "@/components/setup-notice";
import { isSupabaseConfigured } from "@/lib/env";

export default function LoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-full items-center px-4 py-16">
        <SetupNotice />
      </div>
    );
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-line bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-accent">Private dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Customer Contact
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          Sign in to see who needs a call or text about their parcel today.
          There is no public sign-up.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
