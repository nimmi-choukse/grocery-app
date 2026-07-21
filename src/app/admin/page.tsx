"use client";

import { useEffect, useState } from "react";

const ACTIONS = [
  {
    title: "Add Product",
    description: "Add a new product to inventory.",
    href: "/admin/products/new",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-8 h-8">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    title: "Edit Products",
    description: "Update products, stock and pricing.",
    href: "/admin/products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-8 h-8">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    title: "View Orders",
    description: "Manage customer orders.",
    href: "/admin/orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-8 h-8">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    title: "Print Orders",
    description: "Open Orders page where invoices and packing slips can be printed.",
    href: "/admin/orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-8 h-8">
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </svg>
    ),
  },
];

export default function AdminDashboard() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');

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

        .action-card {
          background: #ffffff;
          border: 1px solid #E7ECF4;
          border-radius: 28px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          display: block;
          text-decoration: none;
          box-shadow: 0 8px 28px rgba(13,59,142,0.08);
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
        }
        .action-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #0D3B8E, #1E56B3);
          transform: scaleY(0);
          transform-origin: top;
          transition: transform 0.3s ease;
        }
        .action-card:hover {
          box-shadow: 0 20px 48px rgba(13,59,142,0.18);
          transform: translateY(-4px);
          border-color: #C9D6EC;
        }
        .action-card:hover::before {
          transform: scaleY(1);
        }
        .action-card:hover .action-icon {
          background: #0D3B8E;
          color: #ffffff;
          transform: scale(1.06);
        }
        .action-card:hover .action-go {
          background: #0D3B8E;
          color: #ffffff;
          transform: translateX(2px);
        }

        .action-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: #EAF0FA;
          color: #0D3B8E;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 22px;
          transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
        }

        .action-go {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #EAF0FA;
          color: #0D3B8E;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.25s ease, color 0.25s ease, transform 0.25s ease;
        }
      `}</style>

      <div className="dash-root max-w-5xl mx-auto pt-6 sm:pt-8" style={{ background: "#F8FAFC" }}>
        {/* Quick Actions */}
        <div
          className={`fade-up ${visible ? "in" : ""} mb-6`}
          style={{ transitionDelay: "0ms" }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "0.09em",
              color: "#D4AF37",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 500,
            }}
          >
            Shivam Traders
          </p>
          <h1
            style={{
              fontSize: "clamp(24px, 4vw, 34px)",
              fontWeight: 700,
              color: "#0D3B8E",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            Quick Actions
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {ACTIONS.map((action, i) => (
            <a
              key={action.title}
              href={action.href}
              className={`action-card fade-up ${visible ? "in" : ""}`}
              style={{ transitionDelay: `${80 + i * 80}ms` }}
            >
              <div className="action-icon">{action.icon}</div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#0D3B8E",
                      letterSpacing: "-0.02em",
                      marginBottom: 6,
                    }}
                  >
                    {action.title}
                  </h2>
                  <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5 }}>
                    {action.description}
                  </p>
                </div>

                <div className="action-go" style={{ flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 16, height: 16 }}>
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </>
  );
}