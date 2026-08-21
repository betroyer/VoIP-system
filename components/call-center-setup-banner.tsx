import { getBusinessPhone } from "@/lib/business-phone";
import { formatPhone } from "@/lib/format";
import { getCallerIdDisplay, isGatewayConfigured } from "@/lib/gateway";
import { isAdminConfigured } from "@/lib/supabase/admin";
import Link from "next/link";

export function CallCenterSetupBanner() {
  const bridge = isGatewayConfigured();
  const inbound = isAdminConfigured();
  const phone = formatPhone(getBusinessPhone());

  if (bridge && inbound) {
    return null;
  }

  // Plan v7: phone/SIM is primary. Gateway is optional office hardware.
  if (!bridge) {
    return (
      <aside className="rounded-xl border border-line bg-card px-4 py-3 text-sm leading-6 shadow-sm">
        <p className="font-medium">Calls use your business phone</p>
        <p className="mt-1 text-muted">
          Tap <strong className="text-foreground">Call</strong> to open the dialer,
          then place it from SIM {phone}. For inbox SMS + dial on the handset, install
          the{" "}
          <Link href="/releases" className="text-accent hover:underline">
            Android staff app
          </Link>
          .
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
      <p className="font-medium">Gateway bridge is on — inbound webhooks incomplete</p>
      <ul className="mt-1 list-disc pl-5">
        {!inbound ? (
          <li>
            Add `SUPABASE_SERVICE_ROLE_KEY` so inbound SMS/call events can be written
            from gateway webhooks.
          </li>
        ) : null}
      </ul>
      <p className="mt-1">
        Caller ID stays on your business SIM ({getCallerIdDisplay()}) when the gateway
        hardware and PBX are configured correctly.
      </p>
    </aside>
  );
}
