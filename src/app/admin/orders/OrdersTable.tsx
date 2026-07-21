"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Printer,
  ClipboardList,
  Search,
  Clock,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ChevronDown,
  MapPin,
  Phone,
  Calendar,
} from "lucide-react";
import type { EnrichedOrder } from "@/app/admin/orders/types";

const STATUS_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  pending: { bg: "#FEF9C3", text: "#854D0E", ring: "#FDE68A" },
  confirmed: { bg: "#DBEAFE", text: "#1E40AF", ring: "#BFDBFE" },
  shipped: { bg: "#EDE9FE", text: "#5B21B6", ring: "#DDD6FE" },
  delivered: { bg: "#DCFCE7", text: "#166534", ring: "#BBF7D0" },
  cancelled: { bg: "#FEE2E2", text: "#991B1B", ring: "#FECACA" },
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle2,
  shipped: Truck,
  delivered: PackageCheck,
  cancelled: XCircle,
};

const STATUSES = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled"];

export function OrdersTable({ orders }: { orders: EnrichedOrder[] }) {
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

  const statusColor = (status: string) =>
    STATUS_COLORS[status] ?? { bg: "#F3F4F6", text: "#374151", ring: "#E5E7EB" };

  return (
    <>
      <style>{`
        .print-action-btn {
          transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .print-action-btn:hover {
          background: #0D3B8E !important;
          color: #ffffff !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(13, 59, 142, 0.25);
        }
        .order-row-card {
          transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
        }
        .order-row-card:hover {
          box-shadow: 0 8px 24px rgba(13, 59, 142, 0.08);
          border-color: #C7D7F0;
          transform: translateY(-1px);
        }
        .status-pill {
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .status-pill:hover {
          transform: translateY(-1px);
        }
        .toolbar-sticky {
          position: sticky;
          top: 16px;
          z-index: 10;
        }
        @media (max-width: 900px) {
          .toolbar-sticky {
            position: static;
          }
        }
      `}</style>

      {/* ── Filter Toolbar ─────────────────────────────────────────── */}
      <div
        className="toolbar-sticky"
        style={{
          background: "#fff",
          borderRadius: 24,
          border: "1px solid #E2E8F0",
          boxShadow: "0 4px 20px rgba(13, 59, 142, 0.06)",
          padding: 20,
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <Search
              size={17}
              strokeWidth={2}
              color="#94A3B8"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Search by name, phone, city, order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px 12px 40px",
                border: "1.5px solid #E2E8F0",
                borderRadius: 16,
                fontSize: 14,
                background: "#F8FAFC",
                outline: "none",
                color: "#1a1a1a",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0D3B8E")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
            />
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {STATUSES.map((s) => {
              const Icon = s !== "all" ? STATUS_ICONS[s] : null;
              const active = statusFilter === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className="status-pill"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 16px",
                    borderRadius: 14,
                    border: "1.5px solid",
                    borderColor: active ? "#0D3B8E" : "#E2E8F0",
                    background: active
                      ? "linear-gradient(135deg, #0D3B8E, #1E56B3)"
                      : "#fff",
                    color: active ? "#fff" : "#475569",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                    boxShadow: active ? "0 4px 12px rgba(13,59,142,0.25)" : "none",
                  }}
                >
                  {Icon && <Icon size={13} strokeWidth={2.5} />}
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Orders List ────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "70px 20px",
            color: "#94A3B8",
            fontSize: 15,
            background: "#fff",
            borderRadius: 24,
            border: "1px solid #E2E8F0",
          }}
        >
          <ClipboardList size={40} strokeWidth={1.5} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          No orders found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((order) => {
            const sc = statusColor(order.status);
            const StatusIcon = STATUS_ICONS[order.status] ?? Clock;
            const isExpanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                className="order-row-card"
                style={{
                  background: "#fff",
                  borderRadius: 20,
                  border: `1px solid ${isExpanded ? "#C7D7F0" : "#E2E8F0"}`,
                  overflow: "hidden",
                  boxShadow: isExpanded ? "0 8px 24px rgba(13,59,142,0.08)" : "0 1px 2px rgba(15,23,42,0.03)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.4fr 1fr 110px 140px 220px 24px",
                    gap: 12,
                    alignItems: "center",
                    padding: "18px 22px",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: 13,
                      color: "#0D3B8E",
                      fontWeight: 700,
                      background: "#EFF4FC",
                      padding: "4px 10px",
                      borderRadius: 8,
                      width: "fit-content",
                    }}
                  >
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>

                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                      {order.profile?.full_name ?? <span style={{ color: "#94A3B8" }}>Unknown</span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                      <Phone size={11} />
                      {order.profile?.phone ?? "—"}
                    </div>
                  </div>

                  <span style={{ fontSize: 13.5, color: "#475569", display: "flex", alignItems: "center", gap: 5 }}>
                    <MapPin size={13} color="#94A3B8" />
                    {order.address ? `${order.address.city}, ${order.address.state}` : "—"}
                  </span>

                  <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>
                    ₹{Number(order.total ?? 0).toFixed(2)}
                  </span>

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "capitalize",
                      background: sc.bg,
                      color: sc.text,
                      width: "fit-content",
                      boxShadow: `0 0 0 1px ${sc.ring} inset`,
                    }}
                  >
                    <StatusIcon size={12} strokeWidth={2.5} />
                    {order.status}
                  </span>

                  <div style={{ display: "flex", gap: 8 }} onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/orders/${order.id}/print`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "8px 12px",
                        borderRadius: 12,
                        border: "1.5px solid #0D3B8E",
                        color: "#0D3B8E",
                        fontSize: 12.5,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                      className="print-action-btn"
                    >
                      <Printer size={13} strokeWidth={2.5} />
                      Invoice
                    </Link>
                    <Link
                      href={`/admin/orders/${order.id}/packaing-slip`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "8px 12px",
                        borderRadius: 12,
                        border: "1.5px solid #0D3B8E",
                        color: "#0D3B8E",
                        fontSize: 12.5,
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                      className="print-action-btn"
                    >
                      <ClipboardList size={13} strokeWidth={2.5} />
                      Slip
                    </Link>
                  </div>

                  <ChevronDown
                    size={16}
                    color="#94A3B8"
                    style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}
                  />
                </div>

                {isExpanded && (
                  <div
                    style={{
                      padding: "22px 26px 26px",
                      background: "#F8FAFC",
                      borderTop: "1px solid #E2E8F0",
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 24,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#1E56B3",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 10,
                        }}
                      >
                        Order Info
                      </p>
                      <p style={{ fontSize: 13.5, color: "#334155", marginBottom: 6 }}>
                        <strong>ID:</strong> <span className="mono">{order.id}</span>
                      </p>
                      <p style={{ fontSize: 13.5, color: "#334155", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                        <Calendar size={13} color="#94A3B8" />
                        {new Date(order.placed_at).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      <p style={{ fontSize: 13.5, color: "#334155" }}>
                        <strong>Total:</strong> ₹{Number(order.total ?? 0).toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#1E56B3",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 10,
                        }}
                      >
                        Delivery Address
                      </p>
                      {order.address ? (
                        <>
                          <p style={{ fontSize: 13.5, color: "#334155", marginBottom: 3 }}>{order.address.line1}</p>
                          {order.address.line2 && (
                            <p style={{ fontSize: 13.5, color: "#334155", marginBottom: 3 }}>{order.address.line2}</p>
                          )}
                          <p style={{ fontSize: 13.5, color: "#334155", marginBottom: 3 }}>
                            {order.address.city}, {order.address.state}
                          </p>
                          <p className="mono" style={{ fontSize: 13.5, color: "#334155" }}>
                            {order.address.pincode}
                          </p>
                        </>
                      ) : (
                        <p style={{ fontSize: 13.5, color: "#94A3B8" }}>Address not found</p>
                      )}
                    </div>

                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#1E56B3",
                          textTransform: "uppercase",
                          letterSpacing: "0.07em",
                          marginBottom: 10,
                        }}
                      >
                        Status
                      </p>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: "capitalize",
                          background: sc.bg,
                          color: sc.text,
                        }}
                      >
                        <StatusIcon size={12} strokeWidth={2.5} />
                        {order.status}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 18, textAlign: "right" }}>
          Showing {filtered.length} of {orders.length} orders
        </p>
      )}
    </>
  );
}