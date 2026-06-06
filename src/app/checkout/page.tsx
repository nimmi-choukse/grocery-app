"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/lib/actions/order";
import { createClient } from "@/lib/supabase/client";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type FormFields = {
  customerName: string;
  phone: string;
  addressLine1: string;
  area: string;
  city: string;
  pincode: string;
  deliveryNotes: string;
};

type FormErrors = Partial<Record<keyof FormFields, string>>;

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

function validate(fields: FormFields): FormErrors {
  const errors: FormErrors = {};
  if (!fields.customerName.trim()) errors.customerName = "Name is required";
  if (!fields.phone.trim()) {
    errors.phone = "Phone number is required";
  } else if (!/^[6-9]\d{9}$/.test(fields.phone.trim())) {
    errors.phone = "Enter a valid 10-digit Indian mobile number";
  }
  if (!fields.addressLine1.trim()) errors.addressLine1 = "Address is required";
  if (!fields.city.trim()) errors.city = "City is required";
  if (!fields.pincode.trim()) {
    errors.pincode = "Pincode is required";
  } else if (!/^\d{6}$/.test(fields.pincode.trim())) {
    errors.pincode = "Enter a valid 6-digit pincode";
  }
  return errors;
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

function InputField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  required = false,
  maxLength,
}: {
  label: string;
  name: keyof FormFields;
  value: string;
  onChange: (name: keyof FormFields, value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-wide text-zinc-500"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`h-11 rounded-xl border px-3.5 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:ring-2 ${
          error
            ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
            : "border-zinc-200 bg-zinc-50 focus:border-[#0c831f] focus:bg-white focus:ring-[#0c831f]/20"
        }`}
      />
      {error && (
        <p className="flex items-center gap-1 text-[11px] font-medium text-red-600">
          <svg className="h-3 w-3 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
            <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm0 4.5a.5.5 0 01.5.5v2a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm0-2a.625.625 0 110 1.25A.625.625 0 016 3.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function EmptyCartState() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
        <span className="text-5xl" aria-hidden>🛒</span>
        <h1 className="mt-4 text-lg font-bold text-zinc-900">Your cart is empty</h1>
        <p className="mt-1 text-sm text-zinc-500">Add some groceries before checking out.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-6 w-full rounded-xl bg-[#0c831f] py-3 text-sm font-bold text-white hover:bg-emerald-700 active:scale-[0.98]"
        >
          Shop now
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function CheckoutPage() {
  const router = useRouter();

  const itemsMap = useCartStore((state) => state.items);
  const items = Object.values(itemsMap);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const [fields, setFields] = useState<FormFields>({
    customerName: "",
    phone: "",
    addressLine1: "",
    area: "",
    city: "",
    pincode: "",
    deliveryNotes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(name: keyof FormFields, value: string) {
    setFields((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handlePlaceOrder() {
    const validationErrors = validate(fields);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  router.push("/auth?role=customer");
  return;
}
      const orderId = await createOrder(items, {
        customerNote: [
          fields.addressLine1.trim(),
          fields.area.trim(),
          fields.city.trim(),
          fields.pincode.trim(),
          fields.deliveryNotes.trim(),
        ]
          .filter(Boolean)
          .join(", "),
      });

      clearCart();
      router.push(`/order/${orderId}`);
    } catch (error) {
      console.error(error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to place order. Please try again."
      );
      setLoading(false);
    }
  }

  if (items.length === 0) return <EmptyCartState />;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:h-16">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-50"
            aria-label="Go back"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1">
            <h1 className="text-base font-extrabold tracking-tight text-zinc-900">Checkout</h1>
            <p className="text-[11px] font-medium text-zinc-500">
              {items.length} item{items.length !== 1 ? "s" : ""} · Cash on delivery
            </p>
          </div>

          <a
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c831f] text-lg text-white shadow-sm"
            aria-label="Go to home"
          >
            🥬
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl gap-6 px-4 py-6 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:py-8">

        {/* ── Left: Delivery form ── */}
        <section className="space-y-6">

          {/* Contact */}
          <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0c831f] text-[10px] font-black text-white">1</span>
              Contact details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Full Name"
                name="customerName"
                value={fields.customerName}
                onChange={handleChange}
                error={errors.customerName}
                placeholder="Ravi Kumar"
                required
              />
              <InputField
                label="Phone Number"
                name="phone"
                value={fields.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="9876543210"
                type="tel"
                maxLength={10}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0c831f] text-[10px] font-black text-white">2</span>
              Delivery address
            </h2>
            <div className="grid gap-4">
              <InputField
                label="Address Line 1"
                name="addressLine1"
                value={fields.addressLine1}
                onChange={handleChange}
                error={errors.addressLine1}
                placeholder="House / Flat no., Building, Street"
                required
              />
              <InputField
                label="Area / Locality"
                name="area"
                value={fields.area}
                onChange={handleChange}
                error={errors.area}
                placeholder="Sector 12, MG Road…"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="City"
                  name="city"
                  value={fields.city}
                  onChange={handleChange}
                  error={errors.city}
                  placeholder="Bengaluru"
                  required
                />
                <InputField
                  label="Pincode"
                  name="pincode"
                  value={fields.pincode}
                  onChange={handleChange}
                  error={errors.pincode}
                  placeholder="560001"
                  maxLength={6}
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery notes */}
          <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-500">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0c831f] text-[10px] font-black text-white">3</span>
              Delivery notes
              <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                Optional
              </span>
            </h2>
            <label
              htmlFor="deliveryNotes"
              className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Note for delivery partner
            </label>
            <textarea
              id="deliveryNotes"
              value={fields.deliveryNotes}
              onChange={(e) => handleChange("deliveryNotes", e.target.value)}
              placeholder="e.g. Leave at door, Ring bell twice…"
              rows={3}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:border-[#0c831f] focus:bg-white focus:ring-2 focus:ring-[#0c831f]/20"
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4">
              <span className="mt-0.5 text-base" aria-hidden>⚠️</span>
              <p className="text-sm font-medium text-red-700">{submitError}</p>
            </div>
          )}

          {/* CTA — visible on mobile only; desktop uses sidebar */}
          <div className="lg:hidden">
            <PlaceOrderButton loading={loading} onPress={handlePlaceOrder} total={total} />
          </div>
        </section>

        {/* ── Right: Order summary sidebar ── */}
        <aside className="space-y-4">
          {/* COD badge */}
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <span className="text-2xl" aria-hidden>💵</span>
            <div>
              <p className="text-sm font-bold text-emerald-800">Cash on Delivery</p>
              <p className="text-xs text-emerald-600">Pay when your order arrives</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-5 py-4">
              <h2 className="text-sm font-bold text-zinc-900">
                Order Summary
                <span className="ml-2 font-normal text-zinc-400">
                  ({items.length} item{items.length !== 1 ? "s" : ""})
                </span>
              </h2>
            </div>

            {/* Items */}
            <ul className="divide-y divide-zinc-50 px-5">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 py-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-lg">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full rounded-xl object-contain p-1"
                      />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-zinc-800">{item.name}</p>
                    {item.unit && (
                      <p className="text-[10px] text-zinc-400">{item.unit}</p>
                    )}
                    <p className="text-xs text-zinc-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-zinc-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="space-y-2 border-t border-zinc-100 px-5 py-4">
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Subtotal</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Delivery fee</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between border-t border-zinc-100 pt-3 text-base font-extrabold text-zinc-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* CTA — desktop sidebar */}
            <div className="hidden px-5 pb-5 lg:block">
              <PlaceOrderButton loading={loading} onPress={handlePlaceOrder} total={total} />
            </div>
          </div>

          <p className="text-center text-[10px] font-medium uppercase tracking-widest text-zinc-400">
            ⚡ Delivery in ~10 minutes
          </p>
        </aside>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} FreshKart · Fast grocery delivery
      </footer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared CTA button                                                           */
/* -------------------------------------------------------------------------- */

function PlaceOrderButton({
  loading,
  onPress,
  total,
}: {
  loading: boolean;
  onPress: () => void;
  total: number;
}) {
  function formatPrice(amount: number) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={loading}
      className="group relative w-full overflow-hidden rounded-xl bg-[#0c831f] py-3.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v3m0 12v3M3 12h3m12 0h3m-2.636-6.364-2.121 2.121M8.757 15.243l-2.121 2.121m0-12.728 2.121 2.121m6.364 6.364 2.121 2.121"
            />
          </svg>
          Placing Order…
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          Place Order (COD) · {formatPrice(total)}
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </span>
      )}
    </button>
  );
}