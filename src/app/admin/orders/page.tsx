import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrdersTable } from "@/app/admin/orders/OrdersTable";
import type { EnrichedOrder, Order, Profile, Address } from "@/app/admin/orders/types";
import { Package, IndianRupee } from "lucide-react";

async function getAdminOrders() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth");
  }

  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("placed_at", { ascending: false });

  if (ordersError) {
    throw new Error(ordersError.message);
  }

  const customerIds = [...new Set((ordersData || []).map((order) => order.customer_id).filter(Boolean))];
  const addressIds = [...new Set((ordersData || []).map((order) => order.address_id).filter(Boolean))];

  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, phone")
    .in("id", customerIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const { data: addressesData, error: addressesError } = await supabase
    .from("addresses")
    .select("id, user_id, label, line1, line2, city, state, pincode, is_default")
    .in("id", addressIds);

  if (addressesError) {
    throw new Error(addressesError.message);
  }

  const profileMap = new Map<string, Profile>();
  (profilesData || []).forEach((profile) => profileMap.set(profile.id, profile));

  const addressMap = new Map<string, Address>();
  (addressesData || []).forEach((address) => addressMap.set(address.id, address));

  return (ordersData || []).map((order) => ({
    ...order,
    profile: order.customer_id ? profileMap.get(order.customer_id) ?? null : null,
    address: order.address_id ? addressMap.get(order.address_id) ?? null : null,
  })) as EnrichedOrder[];
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  const today = new Date().toDateString();
  const todaysOrders = orders.filter(
    (o) => new Date(o.placed_at).toDateString() === today
  ).length;
  
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  const summaryCards = [
    {
      label: "Today's Orders",
      value: todaysOrders,
      icon: Package,
      accent: "#0D3B8E",
      bg: "#EFF4FC",
    },
    
    {
      label: "Revenue",
      value: `₹${revenue.toFixed(2)}`,
      icon: IndianRupee,
      accent: "#8A6D1E",
      bg: "#FBF3D9",
    },
  ];

  return (
    <div style={{ background: "#F5F8FD", minHeight: "100vh", padding: "32px 24px 60px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* ── Hero ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            background: "linear-gradient(135deg, #0D3B8E 0%, #1E56B3 55%, #0D3B8E 100%)",
            padding: "36px 40px",
            marginBottom: 28,
            boxShadow: "0 20px 50px rgba(13, 59, 142, 0.25)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              filter: "blur(10px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -80,
              left: "30%",
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(212,175,55,0.18)",
              filter: "blur(30px)",
            }}
          />
          <div style={{ position: "relative" }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: "#fff", margin: 0 }}>
              📦 Orders
            </h1>
            <p style={{ color: "#DCE7FB", fontSize: 15, marginTop: 8 }}>
              Manage customer orders efficiently.
            </p>
          </div>
        </div>

        {/* ── Summary Cards ────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: "1px solid #E2E8F0",
                  padding: "20px 22px",
                  boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: card.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={card.accent} strokeWidth={2.2} />
                </div>
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: "#94A3B8", margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {card.label}
                  </p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", margin: "4px 0 0" }}>
                    {card.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <OrdersTable orders={orders} />
      </div>
    </div>
  );
}