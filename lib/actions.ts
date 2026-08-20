"use server";

import { createClient } from "@/lib/supabase/server";
import { smsLink } from "@/lib/phone-links";
import { isPhilippineNumber, isTwilioConfigured, sendTwilioSms } from "@/lib/twilio";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type ActionState = { error: string | null };
export type SmsActionState = ActionState & {
  smsLink?: string;
  sent?: boolean;
};

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function createCustomer(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const phone_number = String(formData.get("phone_number") ?? "").trim();
  const network = String(formData.get("network") ?? "other");
  const address = String(formData.get("address") ?? "").trim() || null;

  if (!name || !phone_number) {
    return { error: "Name and phone number are required." };
  }

  const { error } = await supabase.from("customers").insert({
    name,
    phone_number,
    network,
    address,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/customers");
  revalidatePath("/orders/new");
  redirect("/customers");
}

export async function createOrder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const customer_id = String(formData.get("customer_id") ?? "");
  const parcel_status = String(formData.get("parcel_status") ?? "pending");
  const tracking_number =
    String(formData.get("tracking_number") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const needs_contact = formData.get("needs_contact") === "on";

  if (!customer_id) {
    return { error: "Choose a customer." };
  }

  const { error } = await supabase.from("orders").insert({
    customer_id,
    parcel_status,
    tracking_number,
    notes,
    needs_contact,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/orders");
  redirect("/orders");
}

export async function updateOrder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const id = String(formData.get("order_id") ?? "");
  const parcel_status = String(formData.get("parcel_status") ?? "pending");
  const tracking_number =
    String(formData.get("tracking_number") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const needs_contact = formData.get("needs_contact") === "on";

  if (!id) {
    return { error: "Missing order." };
  }

  const { error } = await supabase
    .from("orders")
    .update({ parcel_status, tracking_number, notes, needs_contact })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  return { error: null };
}

export async function logContact(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in first." };
  }

  const order_id = String(formData.get("order_id") ?? "");
  const contact_type = String(formData.get("contact_type") ?? "call");
  const outcome = String(formData.get("outcome") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const needs_contact = formData.get("needs_contact") === "on";
  const parcel_status = String(formData.get("parcel_status") ?? "").trim();
  const recording = formData.get("recording");

  if (!order_id || !outcome) {
    return { error: "Choose an outcome before saving." };
  }

  let recording_link: string | null = null;
  if (recording instanceof File && recording.size > 0) {
    const safeName = recording.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${user.id}/${order_id}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("call-recordings")
      .upload(path, recording, { upsert: false });

    if (uploadError) {
      return { error: `Recording upload failed: ${uploadError.message}` };
    }

    recording_link = path;
  }

  const { error } = await supabase.from("contact_logs").insert({
    order_id,
    staff_id: user.id,
    contact_type,
    outcome,
    notes,
    recording_link,
  });

  if (error) {
    return { error: error.message };
  }

  const orderPatch: Record<string, unknown> = { needs_contact };
  if (parcel_status) {
    orderPatch.parcel_status = parcel_status;
  }

  const { error: orderError } = await supabase
    .from("orders")
    .update(orderPatch)
    .eq("id", order_id);

  if (orderError) {
    return { error: orderError.message };
  }

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath(`/orders/${order_id}`);
  revalidatePath("/logs");
  return { error: null };
}

export async function sendCustomerSms(
  _prev: SmsActionState,
  formData: FormData,
): Promise<SmsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in first." };
  }

  const order_id = String(formData.get("order_id") ?? "");
  const phone_number = String(formData.get("phone_number") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!order_id || !phone_number || !body) {
    return { error: "Message and customer number are required." };
  }

  if (!isPhilippineNumber(phone_number)) {
    return { error: "SMS is limited to Philippine numbers." };
  }

  if (isTwilioConfigured()) {
    const result = await sendTwilioSms(phone_number, body);
    if (!result.ok) {
      return { error: result.error };
    }

    const { error } = await supabase.from("contact_logs").insert({
      order_id,
      staff_id: user.id,
      contact_type: "sms",
      outcome: "sent",
      notes: body.slice(0, 500),
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/");
    revalidatePath("/orders");
    revalidatePath(`/orders/${order_id}`);
    revalidatePath("/logs");
    return { error: null, sent: true };
  }

  return { error: null, smsLink: smsLink(phone_number, body) };
}

export async function logBrowserCall(input: {
  orderId: string;
  customerPhone: string;
  outcome: "answered" | "no_answer" | "busy" | "failed";
  notes?: string;
}): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You need to sign in first." };
  }

  const { error } = await supabase.from("contact_logs").insert({
    order_id: input.orderId,
    staff_id: user.id,
    contact_type: "call",
    outcome: input.outcome,
    notes: input.notes ?? `In-browser call to ${input.customerPhone}`,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath(`/orders/${input.orderId}`);
  revalidatePath("/logs");
  return { error: null };
}
