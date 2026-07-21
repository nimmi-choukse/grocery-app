"use client";

import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import type { PrintableOrder } from "@/app/admin/orders/print-types";

export function PackingSlipView({ order }: { order: PrintableOrder }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 print:bg-white print:py-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #slip-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      <div className="no-print mx-auto mb-6 flex max-w-2xl items-center justify-between px-4">
        <Link
          href="/admin/orders/${order.id}/print"
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all duration-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          Back to Orders
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl bg-[#0D3B8E] px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#1E56B3]"
        >
          <Printer className="h-4 w-4" strokeWidth={2.25} />
          Print Packing Slip
        </button>
      </div>

      <div
        id="slip-sheet"
        className="mx-auto max-w-2xl rounded-2xl border border-gray-100 bg-white p-10 shadow-lg print:p-0"
      >
        {/* Header */}
        <div className="border-b-4 border-[#0D3B8E] pb-4 text-center">
          <h1 className="text-2xl font-bold text-[#0D3B8E]">Shivam Traders</h1>
          <p className="text-xs text-gray-500">Packing Slip · For Delivery Use</p>
        </div>

        {/* Large order number */}
        <div className="my-6 rounded-2xl bg-blue-50 py-6 text-center">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Order #</p>
          <p className="mt-1 font-mono text-4xl font-black tracking-wider text-[#0D3B8E]">
            {order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Customer */}
        <div className="grid grid-cols-2 gap-6 border-b border-gray-200 pb-6">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
              Customer
            </p>
            <p className="text-base font-semibold text-gray-900">
              {order.profile?.full_name ?? "Unknown customer"}
            </p>
            <p className="text-sm text-gray-500">{order.profile?.phone ?? "—"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
              Delivery Address
            </p>
            {order.address ? (
              <p className="text-sm text-gray-700">
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ""}
                <br />
                {order.address.city}, {order.address.state} — {order.address.pincode}
              </p>
            ) : (
              <p className="text-sm text-gray-400">Address not found</p>
            )}
          </div>
        </div>

        {/* Products — quantities only, no prices */}
        <div className="py-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
            Items to Pack
          </p>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                <th className="py-2">Product</th>
                <th className="py-2 text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">
                    {item.products?.name ?? "Unknown product"}
                    {item.products?.unit ? (
                      <span className="text-gray-400"> · {item.products.unit}</span>
                    ) : null}
                  </td>
                  <td className="py-3 text-right text-lg font-bold text-gray-900">
                    {item.qty}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delivery notes */}
        {order.customer_note && (
          <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
              Delivery Notes
            </p>
            <p className="text-sm text-gray-700">{order.customer_note}</p>
          </div>
        )}
      </div>
    </div>
  );
}