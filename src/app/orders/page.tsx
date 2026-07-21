"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

type Order = {
  id: string;
  customer_id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  placed_at: string;
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  preparing: {
    label: "Preparing",
    className: "bg-orange-50 text-orange-700 ring-orange-600/20",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    className: "bg-purple-50 text-purple-700 ring-purple-600/20",
  },
  delivered: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-700 ring-red-600/20",
  },
};

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-zinc-100 text-zinc-600 ring-zinc-400/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function OrderCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-36 rounded-lg bg-zinc-200" />
          <div className="h-3 w-28 rounded-lg bg-zinc-100" />
        </div>
        <div className="h-6 w-24 rounded-full bg-zinc-200" />
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="h-5 w-20 rounded-lg bg-zinc-200" />
        <div className="h-9 w-28 rounded-xl bg-zinc-200" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-20 text-center">
      <span className="text-5xl" aria-hidden>
        🛒
      </span>
      <h2 className="mt-4 text-lg font-bold text-zinc-900">No orders yet</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Your order history will appear here once you place an order.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-white px-6 py-16 text-center shadow-sm">
      <span className="text-4xl" aria-hidden>⚠️</span>
      <h2 className="mt-4 text-lg font-bold text-zinc-900">
        Could not load orders
      </h2>
      <p className="mt-1 text-sm text-zinc-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-xl bg-[#0c831f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.98]"
      >
        Try again
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("id, customer_id, status, subtotal, delivery_fee, total, placed_at")
        .eq("customer_id", user.id)
        .order("placed_at", { ascending: false });

      if (fetchError) throw new Error(fetchError.message);

      setOrders(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-4 sm:h-16">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50"
            aria-label="Go back"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-base font-extrabold tracking-tight text-zinc-900">
              Order History
            </h1>
            {!loading && orders.length > 0 && (
              <p className="text-[11px] font-medium text-zinc-500">
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* SHIVAM TRADERS logo chip */}
          <a
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c831f] text-lg text-white shadow-sm"
            aria-label="Go to home"
          >
            🥬
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 px-4 py-6">
        {loading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <OrderCardSkeleton key={i} />
            ))}
          </>
        ) : error ? (
          <ErrorState message={error} onRetry={loadOrders} />
        ) : orders.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-4" role="list">
            {orders.map((order) => (
              <li
                key={order.id}
                className="group rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
              >
                {/* Top row: ID + status */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Order{" "}
                      <span className="font-mono text-zinc-500">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </p>
                    <time
                      dateTime={order.placed_at}
                      className="mt-0.5 block text-xs text-zinc-400"
                    >
                      {formatDate(order.placed_at)}
                    </time>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-zinc-100" />

                {/* Bottom row: total + CTA */}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
                      Total
                    </p>
                    <p className="text-base font-extrabold text-zinc-900">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => router.push(`/order/${order.id}`)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#0c831f]/30 bg-emerald-50 px-4 py-2 text-xs font-semibold text-[#0c831f] transition-all duration-200 hover:bg-[#0c831f] hover:text-white active:scale-[0.97]"
                  >
                    View Details
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} FreshKart · Fast grocery delivery
      </footer>
    </div>
  );
}