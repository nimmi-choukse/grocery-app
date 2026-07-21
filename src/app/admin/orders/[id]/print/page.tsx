import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceView } from "./InvoiceView";
import type { PrintableOrder } from "@/app/admin/orders/print-types";

async function getOrder(id: string): Promise<PrintableOrder | null> {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !order) return null;

  const [profileRes, addressRes, itemsRes] = await Promise.all([
    order.customer_id
      ? supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("id", order.customer_id)
          .single()
      : Promise.resolve({ data: null }),
    order.address_id
      ? supabase
          .from("addresses")
          .select("line1, line2, city, state, pincode")
          .eq("id", order.address_id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("order_items")
      .select("id, product_id, qty, unit_price, products(name, unit)")
      .eq("order_id", id),
  ]);

  return {
    ...order,
    profile: profileRes.data ?? null,
    address: addressRes.data ?? null,
    items: itemsRes.data ?? [],
  } as PrintableOrder;
}

export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await getOrder(id);

  if (!order) notFound();

  return <InvoiceView order={order} />;
}