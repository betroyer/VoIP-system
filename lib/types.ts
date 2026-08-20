export type Network = "tnt" | "smart" | "globe" | "other";

export type ParcelStatus =
  | "pending"
  | "packed"
  | "in_transit"
  | "out_for_delivery"
  | "awaiting_customer"
  | "delayed"
  | "delivered"
  | "cancelled";

export type ContactType = "call" | "sms";

export type ContactOutcome =
  | "answered"
  | "no_answer"
  | "busy"
  | "confirmed"
  | "declined"
  | "wrong_number"
  | "sent"
  | "failed";

export type Staff = {
  id: string;
  name: string;
  email: string;
};

export type Customer = {
  id: string;
  name: string;
  phone_number: string;
  network: Network;
  address: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  customer_id: string;
  parcel_status: ParcelStatus;
  tracking_number: string | null;
  notes: string | null;
  needs_contact: boolean;
  created_at: string;
  updated_at: string;
};

export type MessageDirection = "inbound" | "outbound";

export type Message = {
  id: string;
  phone_number: string;
  customer_id: string | null;
  staff_id: string | null;
  direction: MessageDirection;
  body: string;
  created_at: string;
  provider_sid: string | null;
};

export type InboxThread = {
  phone_number: string;
  last_body: string;
  last_at: string;
  direction: MessageDirection;
  customer: Pick<Customer, "id" | "name" | "phone_number"> | null;
};

export type ContactLog = {
  id: string;
  order_id: string;
  staff_id: string;
  contact_type: ContactType;
  timestamp: string;
  outcome: ContactOutcome;
  notes: string | null;
  recording_link: string | null;
};

export type OrderWithCustomer = Order & {
  customers: Customer;
  contact_logs: ContactLog[];
};

export type ContactLogWithRelations = ContactLog & {
  orders: Pick<Order, "id" | "parcel_status" | "tracking_number"> & {
    customers: Pick<Customer, "id" | "name" | "phone_number" | "network">;
  };
  staff: Pick<Staff, "id" | "name" | "email"> | null;
};
