"use client";

import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import type { PrintableOrder } from "@/app/admin/orders/print-types";

function formatPrice(amount: number | null) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InvoiceView({ order }: { order: PrintableOrder }) {
  const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}`;
  const lineItems = order.items.map((item) => ({
    name: item.products?.name ?? "Unknown product",
    unit: item.products?.unit ?? "",
    qty: item.qty,
    unitPrice: item.unit_price,
    lineTotal: item.qty * item.unit_price,
  }));

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 print:bg-white print:py-0">
      {/* Print-only CSS */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #invoice-sheet {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          @page { size: A4; margin: 14mm; }
        }
      `}</style>

      {/* Top action bar — hidden on print */}
      <div className="no-print mx-auto mb-6 flex max-w-3xl items-center justify-between px-4">
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
          Print Invoice
        </button>
      </div>

      {/* Invoice sheet */}
      <div
        id="invoice-sheet"
        className="mx-auto max-w-3xl rounded-2xl border border-gray-100 bg-white p-10 shadow-lg print:p-0"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#0D3B8E] text-lg font-black text-white">
              ST
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#0D3B8E]">Shivam Traders</h1>
              <p className="text-xs text-gray-500">Your Daily Needs, Our Priority</p>
              <p className="mt-1 text-xs text-gray-400">
                123 Market Road, Indore, Madhya Pradesh, 452001
              </p>
              <p className="text-xs text-gray-400">Phone: +91 98765 43210</p>
              <p className="text-xs text-gray-400">GSTIN: 23ABCDE1234F1Z5 (placeholder)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">TAX INVOICE</p>
            <p className="mt-1 text-xs text-gray-500">{invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice + customer details */}
        <div className="grid grid-cols-2 gap-8 border-b border-gray-200 py-6">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              Bill To
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {order.profile?.full_name ?? "Unknown customer"}
            </p>
            <p className="text-sm text-gray-500">{order.profile?.phone ?? "—"}</p>
            {order.address ? (
              <p className="mt-1 text-sm text-gray-500">
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ""}
                <br />
                {order.address.city}, {order.address.state} — {order.address.pincode}
              </p>
            ) : (
              <p className="mt-1 text-sm text-gray-400">Address not found</p>
            )}
          </div>
          <div className="text-right">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
              Order Details
            </p>
            <p className="text-sm text-gray-500">
              Order ID: <span className="font-mono text-gray-800">#{order.id.slice(0, 8).toUpperCase()}</span>
            </p>
            <p className="text-sm text-gray-500">Date: {formatDate(order.placed_at)}</p>
            <p className="text-sm text-gray-500">
              Payment: <span className="capitalize">{order.payment_method ?? "—"}</span>
            </p>
            <p className="text-sm text-gray-500">
              Status: <span className="capitalize">{order.status}</span>
            </p>
          </div>
        </div>

        {/* Product table */}
        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
              <th className="py-2">Product</th>
              <th className="py-2 text-center">Qty</th>
              <th className="py-2 text-right">Unit Price</th>
              <th className="py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 text-gray-900">
                  {item.name}
                  {item.unit ? <span className="text-gray-400"> · {item.unit}</span> : null}
                </td>
                <td className="py-3 text-center text-gray-700">{item.qty}</td>
                <td className="py-3 text-right text-gray-700">{formatPrice(item.unitPrice)}</td>
                <td className="py-3 text-right font-semibold text-gray-900">
                  {formatPrice(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-800">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Delivery Fee</span>
              <span className="text-gray-800">{formatPrice(order.delivery_fee)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
              <span>Grand Total</span>
              <span className="text-xl text-[#0D3B8E]">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t border-gray-200 pt-6 text-center">
          <p className="text-sm font-semibold text-gray-700">
            Thank you for shopping with Shivam Traders.
          </p>
          <p className="mt-1 text-xs text-gray-400">Visit Again.</p>
        </div>
      </div>
    </div>
  );
}