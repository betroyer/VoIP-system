import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="rounded-xl border border-line bg-card p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Not found</h1>
        <p className="mt-2 text-sm text-muted">That page or order does not exist.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-accent hover:underline">
          Back to queue
        </Link>
      </div>
    </div>
  );
}
