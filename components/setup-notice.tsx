export function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-xl border border-line bg-card p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Connect Supabase to continue</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Copy <code className="rounded bg-background px-1 py-0.5">.env.example</code> to{" "}
        <code className="rounded bg-background px-1 py-0.5">.env.local</code>, paste your
        project URL and anon key, then run the SQL in{" "}
        <code className="rounded bg-background px-1 py-0.5">supabase/schema.sql</code>.
      </p>
    </div>
  );
}
