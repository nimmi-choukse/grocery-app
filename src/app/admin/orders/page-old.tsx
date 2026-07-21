"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Order {
  id: string;
  customer_id: string;
  address_id: string;
  status: string;
  total: number;
  placed_at: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
}

interface Profile {
  id: string;
  full_name: string;
  phone: string;
}

interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

interface EnrichedOrder extends Order {
  profile: Profile | null;
  address: Address | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:   { bg: "#FEF9C3", text: "#854D0E" },
  confirmed: { bg: "#DBEAFE", text: "#1E40AF" },
  shipped:   { bg: "#EDE9FE", text: "#5B21B6" },
  delivered: { bg: "#DCFCE7", text: "#166534" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B" },
};

const STATUSES = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.profile?.full_name?.toLowerCase().includes(q) ||
          o.profile?.phone?.includes(q) ||
          o.address?.city?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
   

      // 1. Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("placed_at", { ascending: false })
        

      if (ordersError) throw ordersError;
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }
      
      // 2. Fetch profiles for all customer_ids
      const customerIds = [...new Set(ordersData.map((o) => o.customer_id).filter(Boolean))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", customerIds);

      if (profilesError) throw profilesError;

      // 3. Fetch addresses for all address_ids
      const addressIds = [...new Set(ordersData.map((o) => o.address_id).filter(Boolean))];
      const { data: addressesData, error: addressesError } = await supabase
        .from("addresses")
        .select("id, line1, line2, city, state, pincode")
        .in("id", addressIds);

      if (addressesError) throw addressesError;

      // 4. Build lookup maps
      const profileMap: Record<string, Profile> = {};
      (profilesData || []).forEach((p) => { profileMap[p.id] = p; });

      const addressMap: Record<string, Address> = {};
      (addressesData || []).forEach((a) => { addressMap[a.id] = a; });

      // 5. Enrich orders
      const enriched: EnrichedOrder[] = ordersData.map((o) => ({
        ...o,
        profile: profileMap[o.customer_id] ?? null,
        address: addressMap[o.address_id] ?? null,
      }));

      setOrders(enriched);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  }

  const statusColor = (status: string) =>
    STATUS_COLORS[status] ?? { bg: "#F3F4F6", text: "#374151" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }
        .mono { font-family: 'DM Mono', monospace; }
      `}</style>

      <div style={{ background: "#FAF8F5", minHeight: "100vh", padding: "32px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
              Orders
            </h1>
            <p style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
              Manage and track customer orders
            </p>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search by name, phone, city, order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 220, padding: "10px 14px",
                border: "1.5px solid #E5E7EB", borderRadius: 10,
                fontSize: 14, background: "#fff", outline: "none", color: "#1a1a1a",
              }}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "8px 14px", borderRadius: 8, border: "1.5px solid",
                    borderColor: statusFilter === s ? "#2D6A4F" : "#E5E7EB",
                    background: statusFilter === s ? "#2D6A4F" : "#fff",
                    color: statusFilter === s ? "#fff" : "#374151",
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* States */}
          {loading && (
            <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 15 }}>
              Loading orders…
            </div>
          )}
          {error && (
            <div style={{
              background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 10,
              padding: "14px 18px", color: "#991B1B", fontSize: 14, marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 15 }}>
              No orders found.
            </div>
          )}

          {/* Orders Table */}
          {!loading && !error && filtered.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 14, border: "1.5px solid #E5E7EB", overflow: "hidden" }}>
              {/* Table Header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr 1.2fr 100px 110px 90px",
                gap: 0, padding: "12px 20px",
                background: "#F9FAFB", borderBottom: "1px solid #E5E7EB",
              }}>
                {["Order ID", "Customer", "City", "Total", "Status", ""].map((h) => (
                  <span key={h} style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </span>
                ))}
              </div>

              {filtered.map((order, idx) => {
                const sc = statusColor(order.status);
                const isExpanded = expandedId === order.id;
                return (
                  <div key={order.id}>
                    {/* Row */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1.4fr 1.2fr 100px 110px 90px",
                        alignItems: "center", padding: "14px 20px",
                        borderBottom: idx < filtered.length - 1 || isExpanded ? "1px solid #F3F4F6" : "none",
                        background: isExpanded ? "#FAFFF9" : "#fff",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      <span className="mono" style={{ fontSize: 13, color: "#2D6A4F", fontWeight: 500 }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                          {order.profile?.full_name ?? <span style={{ color: "#9ca3af" }}>Unknown</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                          {order.profile?.phone ?? "—"}
                        </div>
                      </div>
                      <span style={{ fontSize: 13, color: "#374151" }}>
                        {order.address ? `${order.address.city}, ${order.address.state}` : "—"}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>
                        ₹{Number(order.total ?? 0).toFixed(2)}
                      </span>
                      <span style={{
                        display: "inline-block", padding: "4px 10px", borderRadius: 20,
                        fontSize: 12, fontWeight: 600, textTransform: "capitalize",
                        background: sc.bg, color: sc.text,
                      }}>
                        {order.status}
                      </span>
                      <span style={{ fontSize: 18, color: "#9ca3af", textAlign: "right" }}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Expanded Panel */}
                    {isExpanded && (
                      <div style={{
                        padding: "20px 24px", background: "#F9FFF8",
                        borderBottom: "1px solid #E5E7EB",
                        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20,
                      }}>
                        {/* Order Info */}
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                            Order Info
                          </p>
                          <p style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                            <strong>ID:</strong>{" "}
                            <span className="mono">{order.id}</span>
                          </p>
                          <p style={{ fontSize: 13, color: "#374151", marginBottom: 4 }}>
                            <strong>Placed:</strong>{" "}
                            {new Date(order.placed_at).toLocaleString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                          <p style={{ fontSize: 13, color: "#374151" }}>
                            <strong>Total:</strong> ₹{Number(order.total ?? 0).toFixed(2)}
                          </p>
                        </div>

                        {/* Delivery Address */}
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                            Delivery Address
                          </p>
                          {order.address ? (
                            <>
                              <p style={{ fontSize: 13, color: "#374151", marginBottom: 2 }}>{order.address.line1}</p>
                              {order.address.line2 && (
                                <p style={{ fontSize: 13, color: "#374151", marginBottom: 2 }}>{order.address.line2}</p>
                              )}
                              <p style={{ fontSize: 13, color: "#374151", marginBottom: 2 }}>
                                {order.address.city}, {order.address.state}
                              </p>
                              <p className="mono" style={{ fontSize: 13, color: "#374151" }}>
                                {order.address.pincode}
                              </p>
                            </>
                          ) : (
                            <p style={{ fontSize: 13, color: "#9ca3af" }}>Address not found</p>
                          )}
                        </div>

                        {/* Update Status */}
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                            Update Status
                          </p>
                          <select
                            value={order.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateStatus(order.id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: "100%", padding: "9px 12px",
                              border: "1.5px solid #D1FAE5", borderRadius: 8,
                              fontSize: 13, background: "#fff", color: "#1a1a1a",
                              cursor: "pointer", outline: "none",
                            }}
                          >
                            {STATUSES.filter((s) => s !== "all").map((s) => (
                              <option key={s} value={s} style={{ textTransform: "capitalize" }}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 14, textAlign: "right" }}>
              Showing {filtered.length} of {orders.length} orders
            </p>
          )}
        </div>
      </div>
    </>
  );
}