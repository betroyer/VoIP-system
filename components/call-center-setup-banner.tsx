import { getCallerIdDisplay, isGatewayConfigured } from "@/lib/gateway";
import { isAdminConfigured } from "@/lib/supabase/admin";

export function CallCenterSetupBanner() {
  const bridge = isGatewayConfigured();
  const inbound = isAdminConfigured();

  if (bridge && inbound) {
    return null;
  }

  return (
    <aside className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
      <p className="font-medium">Call center from this PC needs the office gateway</p>
      <ul className="mt-1 list-disc pl-5">
        {!bridge ? (
          <li>
            Add `GATEWAY_BRIDGE_URL` so the dashboard can reach your local PBX/gateway
            bridge.
          </li>
        ) : null}
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
