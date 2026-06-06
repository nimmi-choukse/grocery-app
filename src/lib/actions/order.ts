"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/types/cart";

type CheckoutData = {
  customerNote?: string;
};

export async function createOrder(
  cartItems: CartItem[],
  checkoutData: CheckoutData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const { data: order, error: orderError } = await supabase
  .from("orders")
  .insert({
    customer_id: user.id,
    status: "pending",
    payment_method: "cod",
    subtotal,
    delivery_fee: 0,
    customer_note: checkoutData.customerNote || null,
    address_id: null,
  })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message || "Failed to create order");
  }

const orderItems = cartItems.map((item) => ({
  order_id: order.id,
  product_id: item.productId,
  qty: item.quantity,
  unit_price: item.price,
}));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return order.id;
}