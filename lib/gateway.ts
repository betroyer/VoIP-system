import { getBusinessPhone } from "@/lib/business-phone";
import { isPhilippineNumber, phoneKey } from "@/lib/phone-links";

type GatewayResult =
  | { ok: true; providerId?: string | null; message?: string | null }
  | { ok: false; error: string };

function getGatewayBridgeUrl() {
  return process.env.GATEWAY_BRIDGE_URL?.trim().replace(/\/$/, "") ?? "";
}

function getGatewayApiKey() {
  return process.env.GATEWAY_API_KEY?.trim() ?? "";
}

export function isGatewayConfigured() {
  return Boolean(getGatewayBridgeUrl());
}

export function getCallerIdDisplay() {
  return process.env.GATEWAY_CALLER_ID?.trim() || getBusinessPhone();
}

async function postGateway<T>(path: string, payload: object): Promise<T> {
  const baseUrl = getGatewayBridgeUrl();
  if (!baseUrl) {
    throw new Error("Gateway bridge is not configured.");
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const apiKey = getGatewayApiKey();
  if (apiKey) {
    headers["x-gateway-api-key"] = apiKey;
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || "Gateway request failed.");
  }

  return data;
}

export async function sendGatewaySms(
  phoneNumber: string,
  body: string,
): Promise<GatewayResult> {
  if (!isGatewayConfigured()) {
    return { ok: false, error: "Gateway bridge is not configured." };
  }

  if (!isPhilippineNumber(phoneNumber)) {
    return { ok: false, error: "SMS is limited to Philippine numbers." };
  }

  try {
    const data = await postGateway<{
      providerId?: string | null;
      message?: string | null;
    }>("/sms/send", {
      to: phoneKey(phoneNumber),
      body,
    });
    return {
      ok: true,
      providerId: data.providerId ?? null,
      message: data.message ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gateway SMS failed.",
    };
  }
}

export async function startGatewayCall(
  phoneNumber: string,
  meta?: Record<string, string | null | undefined>,
): Promise<GatewayResult> {
  if (!isGatewayConfigured()) {
    return { ok: false, error: "Gateway bridge is not configured." };
  }

  if (!isPhilippineNumber(phoneNumber)) {
    return { ok: false, error: "Calls are limited to Philippine numbers." };
  }

  try {
    const data = await postGateway<{
      providerId?: string | null;
      message?: string | null;
    }>("/calls/start", {
      to: phoneKey(phoneNumber),
      meta: meta ?? {},
    });
    return {
      ok: true,
      providerId: data.providerId ?? null,
      message: data.message ?? null,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Gateway call failed.",
    };
  }
}

export function isGatewayWebhookAuthorized(request: Request) {
  const expected = getGatewayApiKey();
  if (!expected) {
    return true;
  }

  const actual = request.headers.get("x-gateway-api-key")?.trim();
  return actual === expected;
}
