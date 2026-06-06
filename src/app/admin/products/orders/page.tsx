"use client";

import { useState, useMemo } from "react";

type Status = "New" | "Packed" | "Out for Delivery" | "Delivered";

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: Status;
  total: number;
  items: number;
}

const MOCK_ORDERS: Order[] = [
  { id: "#1042", customer: "Priya Sharma",    email: "priya.s@email.com",   date: "2026-06-06", status: "New",             total: 34.97, items: 4 },
  { id: "#1041", customer: "Rohan Mehta",     email: "rohan.m@email.com",   date: "2026-06-06", status: "Packed",          total: 22.45, items: 3 },
  { id: "#1040", customer: "Ananya Iyer",     email: "ananya.i@email.com",  date: "2026-06-05", status: "Out for Delivery", total: 58.20, items: 7 },
  { id: "#1039", customer: "Karan Patel",     email: "karan.p@email.com",   date: "2026-06-05", status: "Delivered",       total: 15.99, items: 2 },
  { id: "#1038", customer: "Sneha Reddy",     email: "sneha.r@email.com",   date: "2026-06-04", status: "Delivered",       total: 47.60, items: 6 },
  { id: "#1037", customer: "Arjun Nair",      email: "arjun.n@email.com",   date: "2026-06-04", status: "Out for Delivery", total: 29.15, items: 3 },
  { id: "#1036", customer: "Meera Gupta",     email: "meera.g@email.com",   date: "2026-06-03", status: "Delivered",       total: 63.80, items: 8 },
  { id: "#1035", customer: "Vikram Singh",    email: "vikram.s@email.com",  date: "2026-06-03", status: "Packed",          total: 18.50, items: 2 },
  { id: "#1034", customer: "Deepika Rao",     email: "deepika.r@email.com", date: "2026-06-02", status: "Delivered",       total: 41.25, items: 5 },
  { id: "#1033", customer: "Rahul Joshi",     email: "rahul.j@email.com",   date: "2026-06-02", status: "New",             total: 12.99, items: 1 },
  { id: "#1032", customer: "Kavya Menon",     email: "kavya.m@email.com",   date: "2026-06-01", status: "Delivered",       total: 55.40, items: 6 },
  { id: "#1031", customer: "Aditya Kumar",    email: "aditya.k@email.com",  date: "2026-06-01", status: "Delivered",       total: 27.75, items: 3 },
];

const STATUS_CONFIG: Record<Status, { bg: string; color: string; dot: string; icon: string }> = {
  "New":             { bg: "#EEF3FB", color: "#1D4E89", dot: "#1D4E89", icon: "✦" },
  "Packed":          { bg: "#FEF6EC", color: "#9B6A1A", dot: "#C97A2A", icon: "◈" },
  "Out for Delivery":{ bg: "#F3EEFB", color: "#5B3A8A", dot: "#7B52B8", icon: "◎" },
  "Delivered":       { bg: "#EEF6F2", color: "#2D6A4F", dot: "#2D6A4F", icon: "✓" },
};

const ALL_STATUSES: (Status | "All")[] = ["All", "New", "Packed", "Out for Delivery", "Delivered"];

function avatar(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(name: string) {
  const colors = ["#D4EDE3", "#D5E4F5", "#E8D5F5", "#F5E8D5", "#F5D5D5", "#D5F5EE"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function avatarTextColor(name: string) {
  const colors = ["#2D6A4F", "#1D4E89", "#5B3A8A", "#9B6A1A", "#9B4343", "#1A6A60"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function formatDate(d: string) {
  const date = new Date(d);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d === today.toISOString().slice(0, 10)) return "Today";
  if (d === yesterday.toISOString().slice(0, 10)) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "All">("All");

  const filtered = useMemo(() => {
    return MOCK_ORDERS.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        o.customer.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: MOCK_ORDERS.length };
    ALL_STATUSES.forEach((s) => {
      if (s !== "All") c[s] = MOCK_ORDERS.filter((o) => o.status === s).length;
    });
    return c;
  }, []);

  const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .orders-root { font-family: 'DM Sans', sans-serif; }

        .search-input {
          background: #FAFAF7; border: 1px solid #E8E6DF; border-radius: 10px;
          padding: 9px 14px 9px 38px; font-size: 13.5px; color: #1a1a14;
          outline: none; width: 100%; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .search-input::placeholder { color: #b0ae9f; }
        .search-input:focus { border-color: #2D6A4F; box-shadow: 0 0 0 3px rgba(45,106,79,0.1); }

        .chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 20px; font-size: 11.5px;
          font-weight: 500; cursor: pointer; border: 1px solid transparent;
          transition: all 0.14s; white-space: nowrap;
          font-family: 'DM Mono', monospace; letter-spacing: 0.02em;
        }

        .table-wrap {
          overflow-x: auto; border-radius: 14px;
          border: 1px solid #E8E6DF; background: #FAFAF7;
        }
        table { width: 100%; border-collapse: collapse; min-width: 620px; }
        thead th {
          padding: 12px 16px; text-align: left;
          font-family: 'DM Mono', monospace; font-size: 10px;
          font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase;
          color: #a0a090; background: #F5F4F0; border-bottom: 1px solid #E8E6DF;
        }
        thead th:first-child { border-radius: 14px 0 0 0; }
        thead th:last-child  { border-radius: 0 14px 0 0; }

        tbody tr { border-bottom: 1px solid #F0EEE8; transition: background 0.12s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #F5F4F0; }
        tbody td { padding: 13px 16px; font-size: 13.5px; color: #1a1a14; vertical-align: middle; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 500;
          white-space: nowrap;
        }

        .action-btn {
          background: none; border: 1px solid #E8E6DF; border-radius: 7px;
          padding: 5px 11px; font-size: 12px; font-weight: 500; color: #7c7c72;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.14s;
        }
        .action-btn:hover { background: #ECEAE4; color: #1a1a14; border-color: #D5D2C8; }

        .stat-card {
          background: #FAFAF7; border: 1px solid #E8E6DF; border-radius: 14px;
          padding: 18px 20px;
        }

        .select-filter {
          background: #FAFAF7; border: 1px solid #E8E6DF; border-radius: 10px;
          padding: 9px 12px; font-size: 13px; color: #3a3a2e;
          font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer;
        }
        .select-filter:focus { border-color: #2D6A4F; }
      `}</style>

      <div className="orders-root max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.09em", color: "#a0a090", textTransform: "uppercase", marginBottom: 4 }}>
            Fulfillment
          </p>
          <h1 style={{ fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: 600, color: "#1a1a14", letterSpacing: "-0.03em" }}>
            Orders
          </h1>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {(["New", "Packed", "Out for Delivery", "Delivered"] as Status[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <div key={s} className="stat-card" style={{ borderTop: `3px solid ${cfg.dot}` }}>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 22, fontWeight: 500, color: "#1a1a14", letterSpacing: "-0.04em" }}>
                  {counts[s]}
                </p>
                <p style={{ fontSize: 12, color: "#7c7c72", marginTop: 2, fontWeight: 500 }}>{s}</p>
              </div>
            );
          })}
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {ALL_STATUSES.map((s) => {
            const active = statusFilter === s;
            const cfg = s === "All"
              ? { bg: "#ECEAE4", color: "#3a3a2e", dot: "#b0ae9f" }
              : STATUS_CONFIG[s as Status];
            return (
              <button
                key={s}
                className="chip"
                onClick={() => setStatusFilter(s)}
                style={{
                  background: active ? cfg.bg : "#F5F4F0",
                  color: active ? cfg.color : "#7c7c72",
                  borderColor: active ? cfg.bg : "#E8E6DF",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? cfg.dot : "#c0beb0", display: "inline-block" }} />
                {s} · {counts[s]}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div style={{ position: "relative", flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
              style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#b0ae9f", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search by customer, order ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="select-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as Status | "All")}>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Total</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div style={{ textAlign: "center", padding: "52px 24px", color: "#a0a090" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}
                        style={{ width: 36, height: 36, margin: "0 auto 12px", color: "#D5D2C8" }}>
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                      </svg>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#7c7c72" }}>No orders found</p>
                      <p style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const cfg = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id}>
                      {/* Order ID */}
                      <td>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, fontWeight: 500, color: "#3a3a2e" }}>
                          {order.id}
                        </span>
                      </td>

                      {/* Customer */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: "50%",
                            background: avatarColor(order.customer),
                            color: avatarTextColor(order.customer),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 700, flexShrink: 0, letterSpacing: "0.02em",
                          }}>
                            {avatar(order.customer)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 500, fontSize: 13.5, lineHeight: 1.2 }}>{order.customer}</p>
                            <p style={{ fontSize: 11.5, color: "#a0a090" }}>{order.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#7c7c72" }}>
                          {formatDate(order.date)}
                        </span>
                      </td>

                      {/* Items */}
                      <td>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: "#3a3a2e" }}>
                          {order.items}
                          <span style={{ color: "#b0ae9f", marginLeft: 2 }}>item{order.items !== 1 ? "s" : ""}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, flexShrink: 0 }} />
                          {order.status}
                        </span>
                      </td>

                      {/* Total */}
                      <td style={{ textAlign: "right" }}>
                        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, color: "#1a1a14" }}>
                          ${order.total.toFixed(2)}
                        </span>
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: "right" }}>
                        <button className="action-btn">View</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-1">
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#a0a090" }}>
            {filtered.length} of {MOCK_ORDERS.length} orders
            {filtered.length > 0 && (
              <span style={{ marginLeft: 12 }}>
                · Total <span style={{ color: "#2D6A4F", fontWeight: 500 }}>${totalRevenue.toFixed(2)}</span>
              </span>
            )}
          </p>
          {(search || statusFilter !== "All") && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("All"); }}
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2D6A4F", background: "none", border: "none", cursor: "pointer" }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </>
  );
}