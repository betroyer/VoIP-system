"use client";

import type { ActionState } from "@/lib/actions";
import { useActionState, type ReactNode } from "react";

type Action = (state: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionForm({
  action,
  children,
  className,
}: {
  action: Action;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction] = useActionState(action, { error: null });

  return (
    <form action={formAction} className={className}>
      {children}
      {state.error ? <p className="text-sm text-danger">{state.error}</p> : null}
    </form>
  );
}
