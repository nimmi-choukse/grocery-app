import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeliveryTable } from "./DeliveryTable";
import type { Address, DeliveryOrder, EnrichedDeliveryOrder, Profile } from "./types";

async function getActiveDeliveryOrders() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  const { data: ordersData, error: ordersError } = (await supabase
    .from("orders")
    .select("id, customer_id, address_id, status, placed_at")
    .not("status", "in", "(delivered,cancelled)")
    .order("placed_at", { ascending: false })) as { data: DeliveryOrder[] | null; error: { message: string } | null };

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  const orderList = ordersData || [];
  const customerIds = [...new Set(orderList.map((order) => order.customer_id).filter(Boolean))];
  const addressIds = [...new Set(orderList.map((order) => order.address_id).filter(Boolean))];

  const profilesQuery = customerIds.length
    ? (await supabase.from("profiles").select("id, full_name, phone").in("id", customerIds)) as {
        data: Profile[] | null;
        error: { message: string } | null;
      }
    : { data: [], error: null };
  const addressesQuery = addressIds.length
    ? (await supabase
        .from("addresses")
        .select("id, line1, line2, city, state, pincode")
        .in("id", addressIds)) as {
        data: Address[] | null;
        error: { message: string } | null;
      }
    : { data: [], error: null };

  const [{ data: profilesData, error: profilesError }, { data: addressesData, error: addressesError }] =
    await Promise.all([profilesQuery, addressesQuery]);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  if (addressesError) {
    throw new Error(addressesError.message);
  }

  const profileMap = new Map<string, Profile>();
  (profilesData || []).forEach((profile) => profileMap.set(profile.id, profile));

  const addressMap = new Map<string, Address>();
  (addressesData || []).forEach((address) => addressMap.set(address.id, address));

  return orderList.map((order) => ({
    ...order,
    profile: order.customer_id ? profileMap.get(order.customer_id) ?? null : null,
    address: order.address_id ? addressMap.get(order.address_id) ?? null : null,
  })) as EnrichedDeliveryOrder[];
}

export default async function DeliveryPage() {
  let orders: EnrichedDeliveryOrder[] = [];

  try {
    orders = await getActiveDeliveryOrders();
  } catch (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] py-10 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[2rem] border border-rose-100 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-rose-500">
              Delivery Dashboard
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-950">Unable to load active deliveries</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Something went wrong while fetching delivery information. Refresh the page to try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
            Delivery Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            View active customer deliveries.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Active delivery orders are shown here in a clean, read-only delivery dashboard. Search by customer name, phone,
            or order ID.
          </p>
        </div>

        <DeliveryTable orders={orders} />
      </div>
    </div>
  );
}
