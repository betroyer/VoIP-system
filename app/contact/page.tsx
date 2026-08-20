import { CallCenterSetupBanner } from "@/components/call-center-setup-banner";
import { DialPad } from "@/components/dial-pad";
import { StaffPage } from "@/lib/auth";
import { DISCLOSURE_SCRIPT } from "@/lib/constants";
import { getCallerIdDisplay, isGatewayConfigured } from "@/lib/gateway";

export default function ContactPage() {
  return (
    <StaffPage>
      <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
      <p className="mt-1 text-sm text-muted">
        Dial a Philippine number and place the call through your office SIM gateway.
        Open inbox to text the same number.
      </p>

      <div className="mt-5">
        <CallCenterSetupBanner />
      </div>

      <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
        {DISCLOSURE_SCRIPT}
      </p>

      <section className="mt-6 rounded-xl border border-line bg-card p-6 shadow-sm">
        <DialPad
          voiceReady={isGatewayConfigured()}
          callerIdDisplay={getCallerIdDisplay()}
        />
      </section>
    </StaffPage>
  );
}
