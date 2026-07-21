export type OrderItemWithProduct = {
  id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  products: { name: string; unit: string | null } | null;
};

export type PrintableOrder = {
  id: string;
  status: string;
  payment_method: string | null;
  subtotal: number | null;
  delivery_fee: number | null;
  total: number | null;
  customer_note: string | null;
  placed_at: string;
  profile: { full_name: string | null; phone: string | null } | null;
  address: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  items: OrderItemWithProduct[];
};