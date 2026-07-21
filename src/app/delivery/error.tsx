"use client";

import type { ReactNode } from "react";

export default function DeliveryError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-rose-100 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.26em] text-rose-500">Delivery Dashboard</p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950">Something went wrong.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            We couldn&apos;t load the delivery dashboard. Please refresh or try again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
