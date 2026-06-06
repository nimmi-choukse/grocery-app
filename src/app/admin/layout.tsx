"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    router.push("/auth");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; }

        .sidebar-enter {
          transform: translateX(-100%);
        }
        .sidebar-visible {
          transform: translateX(0);
        }

        .nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #7c7c72;
          transition: all 0.18s ease;
          text-decoration: none;
          letter-spacing: -0.01em;
        }

        .nav-link:hover {
          color: #1a1a14;
          background: #ECEAE4;
        }

        .nav-link.active {
          color: #1a1a14;
          background: #E2DFD8;
          font-weight: 600;
        }

        .nav-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: #2D6A4F;
          border-radius: 0 3px 3px 0;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #9B4343;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
          text-align: left;
          letter-spacing: -0.01em;
        }

        .logout-btn:hover {
          background: #F5E8E8;
          color: #7A2828;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(2px);
          z-index: 30;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }

        .overlay.visible {
          opacity: 1;
          pointer-events: all;
        }

        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 240px;
          background: #FAFAF7;
          border-right: 1px solid #E8E6DF;
          z-index: 40;
          display: flex;
          flex-direction: column;
          transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (min-width: 1024px) {
          .sidebar {
            transform: translateX(0) !important;
            position: sticky;
            top: 0;
            height: 100vh;
            flex-shrink: 0;
          }
          .overlay {
            display: none !important;
          }
        }

        .brand-dot {
          width: 8px;
          height: 8px;
          background: #2D6A4F;
          border-radius: 50%;
          display: inline-block;
        }

        .topbar {
          height: 56px;
          background: #FAFAF7;
          border-bottom: 1px solid #E8E6DF;
          display: flex;
          align-items: center;
          padding: 0 20px;
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 6px;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .hamburger:hover { background: #ECEAE4; }
        .hamburger span {
          display: block;
          width: 20px;
          height: 1.5px;
          background: #1a1a14;
          border-radius: 2px;
          transition: all 0.2s;
        }

        .main-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
      `}</style>

      {/* Overlay for mobile */}
      <div
        className={`overlay ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{ transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#E8E6DF]">
          <div className="flex items-center gap-2.5">
            <span className="brand-dot" />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, color: "#1a1a14", letterSpacing: "0.06em" }}>
              ADMIN
            </span>
          </div>
          <p style={{ fontSize: 11, color: "#a0a090", marginTop: 4, fontFamily: "'DM Mono', monospace", letterSpacing: "0.03em" }}>
            Control Panel
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", color: "#b0ae9f", marginBottom: 6, paddingLeft: 14, textTransform: "uppercase" }}>
            Navigation
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[#E8E6DF]">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: "linear-gradient(135deg, #2D6A4F, #52B788)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: "white", flexShrink: 0
            }}>A</div>
            <div className="min-w-0">
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a14", lineHeight: 1.2 }}>Admin User</p>
              <p style={{ fontSize: 11, color: "#a0a090", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                admin@example.com
              </p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5 flex-shrink-0">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar (mobile) */}
        <header className="topbar lg:hidden">
          <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500, color: "#1a1a14", letterSpacing: "0.06em", marginLeft: 12 }}>
            ADMIN
          </span>
        </header>

        {/* Topbar (desktop) */}
        <header className="topbar hidden lg:flex justify-between">
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#a0a090", letterSpacing: "0.04em" }}>
            {pathname.split("/").filter(Boolean).join(" / ")}
          </div>
          <div className="flex items-center gap-2">
            <span className="brand-dot" />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#a0a090" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}