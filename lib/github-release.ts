export type ReleaseAsset = {
  name: string;
  downloadUrl: string;
  size: number;
};

export type AppRelease = {
  tagName: string;
  name: string;
  publishedAt: string;
  body: string;
  htmlUrl: string;
  apk: ReleaseAsset | null;
};

const DEFAULT_REPO = "betroyer/VoIP-system";

function getGithubRepo() {
  return process.env.GITHUB_REPO ?? process.env.NEXT_PUBLIC_GITHUB_REPO ?? DEFAULT_REPO;
}

export async function getLatestAppRelease(): Promise<AppRelease | null> {
  const repo = getGithubRepo();

  const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, {
    next: { revalidate: 300 },
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "customer-contact-releases-page",
    },
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    tag_name: string;
    name: string | null;
    published_at: string;
    body: string | null;
    html_url: string;
    assets?: Array<{ name: string; browser_download_url: string; size: number }>;
  };

  const apk =
    data.assets?.find((asset) => asset.name.toLowerCase().endsWith(".apk")) ?? null;

  return {
    tagName: data.tag_name,
    name: data.name ?? data.tag_name,
    publishedAt: data.published_at,
    body: data.body ?? "",
    htmlUrl: data.html_url,
    apk: apk
      ? {
          name: apk.name,
          downloadUrl: apk.browser_download_url,
          size: apk.size,
        }
      : null,
  };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getGithubReleasesUrl() {
  return `https://github.com/${getGithubRepo()}/releases`;
}
