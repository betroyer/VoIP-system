import {
  formatBytes,
  getGithubReleasesUrl,
  getLatestAppRelease,
} from "@/lib/github-release";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Install Android app — Customer Contact",
  description: "Download the staff Android APK for SMS and calls on the business SIM.",
};

export const dynamic = "force-dynamic";

export default async function ReleasesPage() {
  const release = await getLatestAppRelease();
  const releasesUrl = getGithubReleasesUrl();

  return (
    <main className="mx-auto min-h-full max-w-2xl px-4 py-12 sm:py-16">
      <p className="text-sm font-medium uppercase tracking-wide text-accent">
        Plan v7 · Android staff app
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Install Customer Contact
      </h1>
      <p className="mt-3 text-base leading-7 text-muted">
        Use this page on your business Android phone to download the latest APK.
        The app sends SMS and places calls through the SIM in the phone and syncs
        threads to Supabase.
      </p>

      <section className="mt-8 rounded-xl border border-line bg-card p-6 shadow-sm">
        {release?.apk ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted">Latest release</p>
                <p className="mt-1 text-xl font-semibold">{release.name}</p>
                <p className="mt-1 text-sm text-muted">
                  {release.tagName} · {formatBytes(release.apk.size)} ·{" "}
                  {new Date(release.publishedAt).toLocaleDateString("en-PH", {
                    dateStyle: "medium",
                  })}
                </p>
              </div>
              <a
                href={release.apk.downloadUrl}
                className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-hover"
              >
                Download APK
              </a>
            </div>
            <p className="mt-4 text-sm text-muted">
              File: <span className="font-mono">{release.apk.name}</span>
            </p>
          </>
        ) : (
          <div>
            <p className="font-medium">No APK published yet</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              When a GitHub release is tagged (for example{" "}
              <code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">
                mobile-v1.0.0
              </code>
              ), the download button will appear here automatically.
            </p>
            <a
              href={releasesUrl}
              className="mt-4 inline-flex rounded-md border border-line bg-background px-4 py-2 text-sm font-medium hover:bg-card"
            >
              Open GitHub Releases
            </a>
          </div>
        )}
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold">Install on your phone</h2>
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-muted">
          <li>
            Open this page on the Android phone (or scan/share the link:{" "}
            <span className="font-mono text-foreground">/releases</span> on your
            deployed site).
          </li>
          <li>Tap <strong className="text-foreground">Download APK</strong>.</li>
          <li>
            If Android blocks the install, go to Settings → Apps → your browser →
            Install unknown apps, and allow installs from that browser.
          </li>
          <li>Open the downloaded file and confirm install.</li>
          <li>
            Sign in with your staff Supabase account. Grant SMS and phone
            permissions when prompted.
          </li>
        </ol>
      </section>

      <section className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
        <strong>Business SIM only.</strong> Install on the phone that holds your
        office SIM (09171392170). SMS and calls go out through that SIM, not through
        the PC dashboard.
      </section>

      <footer className="mt-10 flex flex-wrap gap-4 text-sm">
        <Link href="/login" className="text-accent hover:underline">
          Staff web login
        </Link>
        <a href={releasesUrl} className="text-accent hover:underline">
          All releases on GitHub
        </a>
      </footer>
    </main>
  );
}
