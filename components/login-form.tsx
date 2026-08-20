"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setPending(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <label className="grid gap-1 text-sm">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="username"
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        Password
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-line bg-white px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
