import { redirect } from "next/navigation";

/** Web Inbox removed — SMS/call live in the Android staff app. */
export default function InboxPage() {
  redirect("/releases");
}
