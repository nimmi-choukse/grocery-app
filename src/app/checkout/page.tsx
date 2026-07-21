"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { createOrder } from "@/lib/actions/order";
import { createClient } from "@/lib/supabase/client";

import { ShoppingBag, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type FormFields = {
  customerName: string;
  phone: string;
  addressLine1: string;
  area: string;
  city: string;
  state: string;
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
  if (!fields.state.trim()) errors.state = "State is required";
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
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-xs font-semibold uppercase tracking-wide text-gray-500"
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
        className={`h-[52px] rounded-xl border px-4 text-sm text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:ring-2 ${
          error
            ? "border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100"
            : "border-gray-200 bg-white focus:border-[#0D3B8E] focus:ring-[#0D3B8E]/20 focus:shadow-[0_0_0_4px_rgba(13,59,142,0.1)]"
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4">
      <div className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-lg transition-all duration-300 hover:shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <ShoppingBag className="h-8 w-8 text-[#0D3B8E]" strokeWidth={1.5} />
        </div>
        <h1 className="mt-4 text-lg font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-1 text-sm text-gray-500">Add some groceries before checking out.</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-6 h-14 w-full rounded-2xl bg-[#0D3B8E] text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#1E56B3] active:scale-[0.98]"
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
    state: "",
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
        customerName: fields.customerName.trim(),
        phone: fields.phone.trim(),
        addressLine1: fields.addressLine1.trim(),
        area: fields.area.trim(),
        city: fields.city.trim(),
        state: fields.state.trim(),
        pincode: fields.pincode.trim(),
        deliveryNotes: fields.deliveryNotes.trim(),
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
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-4 sm:h-20">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-600 transition-all duration-300 hover:bg-gray-50 hover:text-[#0D3B8E]"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#0D3B8E] sm:text-4xl">Checkout</h1>
            <p className="mt-1 text-sm text-gray-500">
              Complete your order securely with Shivam Traders
            </p>
          </div>

          <a
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0D3B8E] text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#1E56B3]"
            aria-label="Go to home"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={2.25} />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl gap-6 px-4 py-8 lg:grid lg:grid-cols-[1fr_380px] lg:items-start lg:py-12">

        {/* ── Left: Delivery form ── */}
        <section className="space-y-6">

          {/* Contact */}
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D3B8E] text-[10px] font-black text-white">1</span>
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
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D3B8E] text-[10px] font-black text-white">2</span>
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
              <div className="grid gap-4 sm:grid-cols-3">
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
                  label="State"
                  name="state"
                  value={fields.state}
                  onChange={handleChange}
                  error={errors.state}
                  placeholder="Karnataka"
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
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl">
            <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D3B8E] text-[10px] font-black text-white">3</span>
              Delivery notes
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-400">
                Optional
              </span>
            </h2>
            <label
              htmlFor="deliveryNotes"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              Note for delivery partner
            </label>
            <textarea
              id="deliveryNotes"
              value={fields.deliveryNotes}
              onChange={(e) => handleChange("deliveryNotes", e.target.value)}
              placeholder="e.g. Leave at door, Ring bell twice…"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none transition-all duration-300 placeholder:text-gray-400 focus:border-[#0D3B8E] focus:ring-2 focus:ring-[#0D3B8E]/20 focus:shadow-[0_0_0_4px_rgba(13,59,142,0.1)]"
            />
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4">
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
        <aside className="mt-6 space-y-4 lg:mt-0">
          {/* COD badge */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-5 py-4">
            <span className="text-2xl" aria-hidden>💵</span>
            <div>
              <p className="text-sm font-bold text-[#0D3B8E]">Cash on Delivery</p>
              <p className="text-xs text-gray-500">Pay when your order arrives</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-sm font-bold text-gray-900">
                Order Summary
                <span className="ml-2 font-normal text-gray-400">
                  ({items.length} item{items.length !== 1 ? "s" : ""})
                </span>
              </h2>
            </div>

            {/* Items */}
            <ul className="divide-y divide-gray-50 px-6">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-3 py-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg">
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
                    <p className="truncate text-xs font-semibold text-gray-800">{item.name}</p>
                    {item.unit && (
                      <p className="text-[10px] text-gray-400">{item.unit}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-[#0D3B8E]">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="space-y-2.5 border-t border-gray-100 px-6 py-5">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery fee</span>
                <span className="font-semibold text-[#0D3B8E]">FREE</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-4 text-base font-bold text-gray-900">
                <span>Total</span>
                <span className="text-2xl font-bold text-[#0D3B8E]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* CTA — desktop sidebar */}
            <div className="hidden px-6 pb-6 lg:block">
              <PlaceOrderButton loading={loading} onPress={handlePlaceOrder} total={total} />
            </div>
          </div>
        </aside>
      </main>

      <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} SHIVAM TRADERS · Fast grocery delivery
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
      className="group relative h-14 w-full overflow-hidden rounded-2xl bg-[#0D3B8E] text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#1E56B3] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} aria-hidden />
          Placing Order…
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          Place Order (COD) · {formatPrice(total)}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2} aria-hidden />
        </span>
      )}
    </button>
  );
}