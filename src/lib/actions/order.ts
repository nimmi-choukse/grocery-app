"use server";

import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/types/cart";

type CheckoutData = {
  customerName: string;
  phone: string;
  addressLine1: string;
  area?: string;
  city: string;
  state: string;
  pincode: string;
  deliveryNotes?: string;
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

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: checkoutData.customerName,
        phone: checkoutData.phone,
        role: "customer",
      },
      {
        onConflict: "id",
      }
    )
    .select("id");

  if (profileError || !profileData) {
    throw new Error(profileError?.message || "Failed to save profile");
  }

  const profile = Array.isArray(profileData) ? profileData[0] : profileData;
  if (!profile || !profile.id) {
    throw new Error("Failed to save profile");
  }

  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      line1: checkoutData.addressLine1,
      line2: checkoutData.area || null,
      city: checkoutData.city,
      state: checkoutData.state,
      pincode: checkoutData.pincode,
    })
    .select("id")
    .single();

  if (addressError || !address) {
    throw new Error(addressError?.message || "Failed to save address");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: user.id,
      status: "pending",
      payment_method: "cod",
      subtotal,
      delivery_fee: 0,
      customer_note: checkoutData.deliveryNotes || null,
      address_id: address.id,
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