export type DeliveryOrder = {
  id: string;
  customer_id: string;
  address_id: string | null;
  status: string;
  placed_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
};

export type Address = {
  id: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
};

export type EnrichedDeliveryOrder = DeliveryOrder & {
  profile: Profile | null;
  address: Address | null;
};
