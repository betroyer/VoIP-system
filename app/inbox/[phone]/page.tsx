import { redirect } from "next/navigation";

/** Web Inbox threads removed — use the Android staff app. */
export default async function InboxThreadPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  await params;
  redirect("/releases");
}
