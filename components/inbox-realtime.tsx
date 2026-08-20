"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function InboxRealtime({ phoneNumber }: { phoneNumber?: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${phoneNumber ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          ...(phoneNumber ? { filter: `phone_number=eq.${phoneNumber}` } : {}),
        },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [phoneNumber, router]);

  return null;
}
