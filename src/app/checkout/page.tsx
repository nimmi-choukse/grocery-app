"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/lib/actions/order";

export default function CheckoutPage() {
  const router = useRouter();

  console.log("CHECKOUT RENDER");


  const itemsMap = useCartStore((state) => state.items);
const items = Object.values(itemsMap);
const subtotal = items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
  const clearCart = useCartStore((state) => state.clearCart);

  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePlaceOrder() {
    try {
      setLoading(true);

      const orderId = await createOrder(items, {
        customerNote,
      });

      clearCart();

      router.push(`/order/${orderId}`);
    } catch (error) {
      console.error(error);
      alert("Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-bold">Checkout</h1>
        <p className="mt-4">Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="font-semibold text-xl mb-4">Order Summary</h2>

        {items.map((item) => (
          <div
            key={item.productId}
            className="flex justify-between py-2 border-b"
          >
            <span>
              {item.name} × {item.quantity}
            </span>

            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}

        <div className="flex justify-between font-bold text-lg mt-4">
          <span>Total</span>
          <span>₹{subtotal}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="font-semibold text-xl mb-4">
          Cash On Delivery
        </h2>

        <textarea
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          placeholder="Delivery note (optional)"
          className="w-full border rounded-lg p-3 mb-4"
        />

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full rounded-xl bg-[#0c831f] py-3 text-white font-bold"
        >
          {loading ? "Placing Order..." : "Place Order (COD)"}
        </button>
      </div>
    </main>
  );
}