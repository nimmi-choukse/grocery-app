"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
}

interface FormState {
  name: string;
  category_id: string;
  price: string;
  compare_price: string;
  unit: string;
  stock_qty: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

interface FormErrors {
  name?: string;
  category_id?: string;
  price?: string;
  stock_qty?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[\u0900-\u097F]+/g, "") // strip Hindi/Devanagari characters
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    category_id: "",
    price: "",
    compare_price: "",
    unit: "",
    stock_qty: "",
    description: "",
    image_url: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      if (!error && data) setCategories(data);
      setCatLoading(false);
    }
    fetchCategories();
  }, []);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Product name is required.";
    if (!form.category_id) e.category_id = "Please select a category.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      e.price = "Price must be greater than 0.";
    if (
      form.stock_qty === "" ||
      isNaN(Number(form.stock_qty)) ||
      Number(form.stock_qty) < 0
    )
      e.stock_qty = "Stock quantity must be 0 or more.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setLoading(true);
    const slug = generateSlug(form.name);

    const payload = {
      name: form.name.trim(),
      slug,
      category_id: form.category_id,
      price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      unit: form.unit.trim() || null,
      stock_qty: Number(form.stock_qty),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
      is_active: form.is_active,
    };
    const {
  data: { user },
} = await supabase.auth.getUser();

console.log("USER:", user);

    const { error } = await supabase.from("products").insert([payload]);

    if (error) {
      setSubmitError(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/products");
  }

  const inputBase =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 transition";
  const errorInput = "border-red-400 focus:border-red-400 focus:ring-red-100";
  const labelBase = "block text-sm font-medium text-zinc-700 mb-1.5";
  const errorText = "mt-1.5 text-xs text-red-500";

  return (
    <div
      className="min-h-screen bg-[#FAFAF7] py-10 px-4"
      style={{
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 transition"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Products
            </p>
            <h1 className="text-xl font-semibold text-zinc-900">
              Add New Product
            </h1>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <form onSubmit={handleSubmit} noValidate>
            {/* Section: Basic Info */}
            <div className="border-b border-zinc-100 px-6 py-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Basic Info
              </h2>
              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label htmlFor="name" className={labelBase}>
                    Product Name{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Fresh Tomatoes / ताज़े टमाटर"
                    className={`${inputBase} ${errors.name ? errorInput : ""}`}
                  />
                  {errors.name && (
                    <p className={errorText}>{errors.name}</p>
                  )}
                  {form.name && (
                    <p className="mt-1.5 text-xs text-zinc-400">
                      Slug:{" "}
                      <span
                        style={{ fontFamily: "'DM Mono', monospace" }}
                        className="text-zinc-500"
                      >
                        {generateSlug(form.name) || "—"}
                      </span>
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category_id" className={labelBase}>
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    disabled={catLoading}
                    className={`${inputBase} ${errors.category_id ? errorInput : ""} ${catLoading ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <option value="">
                      {catLoading ? "Loading categories…" : "Select a category"}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className={errorText}>{errors.category_id}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className={labelBase}>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Short product description…"
                    className={`${inputBase} resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Section: Pricing */}
            <div className="border-b border-zinc-100 px-6 py-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Pricing
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div>
                  <label htmlFor="price" className={labelBase}>
                    Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={`${inputBase} ${errors.price ? errorInput : ""}`}
                  />
                  {errors.price && (
                    <p className={errorText}>{errors.price}</p>
                  )}
                </div>

                {/* Compare Price */}
                <div>
                  <label htmlFor="compare_price" className={labelBase}>
                    Compare Price (₹)
                  </label>
                  <input
                    id="compare_price"
                    name="compare_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.compare_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* Section: Inventory */}
            <div className="border-b border-zinc-100 px-6 py-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Inventory
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {/* Unit */}
                <div>
                  <label htmlFor="unit" className={labelBase}>
                    Unit
                  </label>
                  <input
                    id="unit"
                    name="unit"
                    type="text"
                    value={form.unit}
                    onChange={handleChange}
                    placeholder="e.g. kg, pcs, litre"
                    className={inputBase}
                  />
                </div>

                {/* Stock Qty */}
                <div>
                  <label htmlFor="stock_qty" className={labelBase}>
                    Stock Quantity <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="stock_qty"
                    name="stock_qty"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock_qty}
                    onChange={handleChange}
                    placeholder="0"
                    className={`${inputBase} ${errors.stock_qty ? errorInput : ""}`}
                  />
                  {errors.stock_qty && (
                    <p className={errorText}>{errors.stock_qty}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Media */}
            <div className="border-b border-zinc-100 px-6 py-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Media
              </h2>
              <div>
                <label htmlFor="image_url" className={labelBase}>
                  Image URL
                </label>
                <input
                  id="image_url"
                  name="image_url"
                  type="url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://…"
                  className={inputBase}
                />
                {form.image_url && (
                  <div className="mt-3">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).style.display = "none")
                      }
                      className="h-20 w-20 rounded-xl border border-zinc-200 object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section: Status + Submit */}
            <div className="px-6 py-5">
              {/* Active Toggle */}
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 hover:bg-zinc-50 transition">
                <div>
                  <p className="text-sm font-medium text-zinc-700">
                    Active
                  </p>
                  <p className="text-xs text-zinc-400">
                    Product will be visible in the store
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    className={`h-6 w-11 rounded-full transition-colors duration-200 ${
                      form.is_active ? "bg-[#2D6A4F]" : "bg-zinc-200"
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      form.is_active ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>

              {/* Error banner */}
              {submitError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push("/admin/products")}
                  className="rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#2D6A4F] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#255c44] disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {loading && (
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      />
                    </svg>
                  )}
                  {loading ? "Saving…" : "Save Product"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}