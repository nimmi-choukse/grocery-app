export type Order = {
  id: string;
  customer_id: string;
  address_id: string | null;
  status: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  payment_method: string;
  customer_note: string | null;
  placed_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  phone: string | null;
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

export type EnrichedOrder = Order & {
  profile: Profile | null;
  address: Address | null;
};
