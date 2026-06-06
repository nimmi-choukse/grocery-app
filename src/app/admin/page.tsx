"use client";

import { useEffect, useState } from "react";

const STATS = [
  {
    label: "Total Products",
    value: 24,
    suffix: "items",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
    trend: "+3 this week",
    trendUp: true,
    accent: "#2D6A4F",
    bg: "#EEF6F2",
    iconBg: "#D4EDE3",
  },
  {
    label: "Active Orders",
    value: 8,
    suffix: "orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    trend: "+2 since yesterday",
    trendUp: true,
    accent: "#1D4E89",
    bg: "#EEF3FB",
    iconBg: "#D5E4F5",
  },
  {
    label: "Out of Stock",
    value: 3,
    suffix: "products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    trend: "Needs attention",
    trendUp: false,
    accent: "#9B4343",
    bg: "#FBF0F0",
    iconBg: "#F5D8D8",
  },
];

const RECENT_ACTIVITY = [
  { action: "New order placed", detail: "Order #1042 · 2 items", time: "4 min ago", dot: "#2D6A4F" },
  { action: "Product restocked", detail: "Organic Tomatoes · 50 units", time: "31 min ago", dot: "#1D4E89" },
  { action: "Low stock alert", detail: "Greek Yogurt · 2 units left", time: "1 hr ago", dot: "#C97A2A" },
  { action: "Order fulfilled", detail: "Order #1039 · Delivered", time: "2 hr ago", dot: "#2D6A4F" },
  { action: "Out of stock", detail: "Whole Wheat Bread", time: "3 hr ago", dot: "#9B4343" },
];

function AnimatedNumber({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 900;
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, step);
    return () => clearInterval(timer);
  }, [target]);

  return <>{display}</>;
}

export default function AdminDashboard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');

        .dash-root { font-family: 'DM Sans', sans-serif; }

        .fade-up {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .fade-up.in {
          opacity: 1;
          transform: translateY(0);
        }

        .stat-card {
          background: #FAFAF7;
          border: 1px solid #E8E6DF;
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          box-shadow: 0 8px 32px rgba(0,0,0,0.07);
          transform: translateY(-2px);
        }
        .stat-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          border-radius: 0 0 16px 16px;
        }

        .activity-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid #F0EEE8;
          transition: background 0.15s;
          border-radius: 8px;
          padding-left: 4px;
          padding-right: 4px;
        }
        .activity-row:last-child { border-bottom: none; }
        .activity-row:hover { background: #F5F4F0; }

        .quick-action {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          background: #FAFAF7;
          border: 1px solid #E8E6DF;
          font-size: 13.5px;
          font-weight: 500;
          color: #3a3a2e;
          cursor: pointer;
          transition: all 0.17s;
          text-decoration: none;
        }
        .quick-action:hover {
          background: #F0EEE8;
          border-color: #D5D2C8;
        }
      `}</style>

      <div className="dash-root max-w-5xl mx-auto">
        {/* Header */}
        <div
          className={`fade-up ${visible ? "in" : ""} mb-8`}
          style={{ transitionDelay: "0ms" }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.09em",
              color: "#a0a090",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            {today}
          </p>
          <h1
            style={{
              fontSize: "clamp(22px, 4vw, 30px)",
              fontWeight: 600,
              color: "#1a1a14",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Good morning 👋
          </h1>
          <p style={{ fontSize: 14, color: "#7c7c72", marginTop: 4 }}>
            Here's what's happening in your store today.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`stat-card fade-up ${visible ? "in" : ""}`}
              style={{
                transitionDelay: `${80 + i * 80}ms`,
              }}
            >
              {/* Color strip at bottom */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: stat.accent,
                  borderRadius: "0 0 16px 16px",
                  opacity: 0.6,
                }}
              />

              {/* Icon */}
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: stat.iconBg,
                  color: stat.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {stat.icon}
              </div>

              {/* Number */}
              <div
                style={{
                  fontSize: "clamp(32px, 5vw, 42px)",
                  fontWeight: 600,
                  color: "#1a1a14",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: 2,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {visible ? <AnimatedNumber target={stat.value} /> : 0}
              </div>

              {/* Suffix */}
              <p
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  color: "#a0a090",
                  marginBottom: 12,
                }}
              >
                {stat.suffix}
              </p>

              {/* Label + trend */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span
                  style={{ fontSize: 14, fontWeight: 600, color: "#3a3a2e" }}
                >
                  {stat.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: stat.bg,
                    color: stat.accent,
                  }}
                >
                  {stat.trend}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Recent Activity */}
          <div
            className={`lg:col-span-3 fade-up ${visible ? "in" : ""}`}
            style={{
              transitionDelay: "320ms",
              background: "#FAFAF7",
              border: "1px solid #E8E6DF",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a14", letterSpacing: "-0.02em" }}>
                Recent Activity
              </h2>
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.07em",
                  color: "#a0a090",
                  textTransform: "uppercase",
                }}
              >
                Today
              </span>
            </div>

            <div>
              {RECENT_ACTIVITY.map((item, i) => (
                <div key={i} className="activity-row">
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.dot,
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: "#1a1a14", marginBottom: 1 }}>
                      {item.action}
                    </p>
                    <p style={{ fontSize: 12, color: "#7c7c72" }}>{item.detail}</p>
                  </div>
                  <span
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      color: "#b0ae9f",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div
            className={`lg:col-span-2 fade-up ${visible ? "in" : ""}`}
            style={{ transitionDelay: "400ms" }}
          >
            <div
              style={{
                background: "#FAFAF7",
                border: "1px solid #E8E6DF",
                borderRadius: 16,
                padding: 24,
                marginBottom: 16,
              }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a14", letterSpacing: "-0.02em", marginBottom: 14 }}>
                Quick Actions
              </h2>
              <div className="flex flex-col gap-2.5">
                <a href="/admin/products/new" className="quick-action">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 16, height: 16, color: "#2D6A4F" }}>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add New Product
                </a>
                <a href="/admin/orders" className="quick-action">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 16, height: 16, color: "#1D4E89" }}>
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                    <rect x="9" y="3" width="6" height="4" rx="1" />
                    <line x1="9" y1="12" x2="15" y2="12" />
                    <line x1="9" y1="16" x2="13" y2="16" />
                  </svg>
                  View All Orders
                </a>
                <a href="/admin/products?filter=out_of_stock" className="quick-action">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 16, height: 16, color: "#9B4343" }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Resolve Out of Stock
                </a>
              </div>
            </div>

            {/* Store health */}
            <div
              style={{
                background: "#EEF6F2",
                border: "1px solid #C8E6D8",
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#2D6A4F",
                    boxShadow: "0 0 0 3px rgba(45,106,79,0.2)",
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2D6A4F" }}>
                  Store Healthy
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#4a8c6a", lineHeight: 1.5 }}>
                87.5% of your products are in stock. A few items need restocking soon.
              </p>
              <div
                style={{
                  marginTop: 12,
                  height: 6,
                  borderRadius: 99,
                  background: "#C8E6D8",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "87.5%",
                    background: "#2D6A4F",
                    borderRadius: 99,
                    transition: "width 1s ease",
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a8c6a" }}>
                  21 / 24 in stock
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: "#4a8c6a" }}>
                  87.5%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}