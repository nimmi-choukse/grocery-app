"use client";

import { useMemo, useState } from "react";
import type { EnrichedDeliveryOrder } from "./types";

function formatAddress(address: EnrichedDeliveryOrder["address"]): string {
  if (!address) {
    return "Delivery address not available.";
  }

  return [address.line1, address.line2, `${address.city}, ${address.state}`, address.pincode]
    .filter(Boolean)
    .join("\n");
}

export function DeliveryTable({ orders }: { orders: EnrichedDeliveryOrder[] }) {
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const orderId = order.id.toLowerCase();
      const name = order.profile?.full_name?.toLowerCase() ?? "";
      const phone = order.profile?.phone?.toLowerCase() ?? "";

      return (
        orderId.includes(query) ||
        name.includes(query) ||
        phone.includes(query)
      );
    });
  }, [orders, search]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <label htmlFor="delivery-search" className="sr-only">
            Search active deliveries
          </label>
          <input
            id="delivery-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by customer name, phone or order ID"
            className="w-full rounded-[2rem] border border-slate-200 bg-white px-5 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <p className="text-sm text-slate-500">
          Showing {filteredOrders.length} active delivery{filteredOrders.length === 1 ? "" : "ies"}
        </p>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/90 px-8 py-14 text-center text-sm text-slate-500 shadow-sm">
          No active deliveries.
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Order ID
                  </p>
                  <p className="text-lg font-semibold text-slate-950">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
                  Active delivery
                </p>
              </div>

              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Customer name
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">
                      {order.profile?.full_name ?? "Unknown Customer"}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Phone number
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {order.profile?.phone ?? "Not available"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Delivery address
                  </p>
                  <pre className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                    {formatAddress(order.address)}
                  </pre>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Date placed
                    </p>
                    <p className="mt-2 text-sm text-slate-700">
                      {new Date(order.placed_at).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Delivery status
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{order.status}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
