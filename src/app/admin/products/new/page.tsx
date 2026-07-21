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
  brand: string;
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
    brand: "",
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

  // --- Auto Fill (AI) state ---
  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [autoFillError, setAutoFillError] = useState<string | null>(null);

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

  // --- Auto Fill Details (calls your existing OpenRouter API route) ---
  // NOTE: adjust the URL / request body / response field names below to
  // match your existing route if it differs from this assumption.
  async function handleAutoFill() {
    if (!form.name.trim()) {
      setAutoFillError("Enter a product name first.");
      return;
    }
    setAutoFillError(null);
    setAutoFillLoading(true);

    try {
      const res = await fetch("/api/generate-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: form.name.trim() }),
      });

      if (!res.ok) {
        throw new Error(`Auto fill failed (${res.status})`);
      }

      const data = await res.json();
      // Expected shape: { description, category, brand, unit }

      const matchedCategory = data.category
        ? categories.find(
            (c) => c.name.toLowerCase() === String(data.category).toLowerCase()
          )
        : null;

      setForm((prev) => ({
        ...prev,
        description: data.description ?? prev.description,
        brand: data.brand ?? prev.brand,
        unit: data.unit ?? prev.unit,
        category_id: matchedCategory ? matchedCategory.id : prev.category_id,
      }));

      if (data.category && !matchedCategory) {
        setAutoFillError(
          `AI suggested category "${data.category}" but it wasn't found in your category list — please select one manually.`
        );
      }
    } catch (err) {
      setAutoFillError(
        err instanceof Error ? err.message : "Could not auto fill details."
      );
    } finally {
      setAutoFillLoading(false);
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
      brand: form.brand.trim() || null,
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
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:border-[#0D3B8E] focus:outline-none focus:ring-4 focus:ring-[#0D3B8E]/10 transition";
  const errorInput = "border-red-400 focus:border-red-400 focus:ring-red-100";
  const labelBase = "block text-sm font-medium text-slate-700 mb-1.5";
  const errorText = "mt-1.5 text-xs text-red-500";
  const sectionLabel =
    "mb-4 text-xs font-semibold uppercase tracking-widest text-[#1E56B3]";
  const cardBase =
    "rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60";

  return (
    <div
      className="min-h-screen bg-[#F5F8FD] pb-32"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <form onSubmit={handleSubmit} noValidate>
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          {/* Back link */}
          <button
            type="button"
            onClick={() => router.push("/admin/products")}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#0D3B8E] transition"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Products
          </button>

          {/* Hero */}
          <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D3B8E] via-[#1E56B3] to-[#0D3B8E] px-6 py-8 shadow-2xl sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-[#D4AF37]/20 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                  📦 Add New Product
                </h1>
                <p className="mt-2 text-sm text-blue-100 sm:text-base">
                  Manage products for Shivam Traders using AI.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <span className="text-[#D4AF37]">✨</span>
                AI Powered
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT COLUMN */}
            <div className="space-y-6 lg:col-span-2">
              {/* Basic Information */}
              <div className={cardBase}>
                <div className="px-6 py-6 sm:px-8">
                  <h2 className={sectionLabel}>Basic Information</h2>
                  <div className="space-y-5">
                    {/* Product Name */}
                    <div>
                      <label htmlFor="name" className={labelBase}>
                        Product Name <span className="text-red-400">*</span>
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
                      {errors.name && <p className={errorText}>{errors.name}</p>}
                      {form.name && (
                        <p className="mt-1.5 text-xs text-slate-400">
                          Slug:{" "}
                          <span
                            style={{ fontFamily: "'DM Mono', monospace" }}
                            className="text-slate-500"
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

                    {/* Brand */}
                    <div>
                      <label htmlFor="brand" className={labelBase}>
                        Brand
                      </label>
                      <input
                        id="brand"
                        name="brand"
                        type="text"
                        value={form.brand}
                        onChange={handleChange}
                        placeholder="e.g. Amul, Tata, Local"
                        className={inputBase}
                      />
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
              </div>

              {/* Pricing */}
              <div className={cardBase}>
                <div className="px-6 py-6 sm:px-8">
                  <h2 className={sectionLabel}>Pricing</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      {errors.price && <p className={errorText}>{errors.price}</p>}
                    </div>
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
              </div>

              {/* Inventory */}
              <div className={cardBase}>
                <div className="px-6 py-6 sm:px-8">
                  <h2 className={sectionLabel}>Inventory</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              {/* AI Assistant */}
              <div className={cardBase}>
                <div className="px-6 py-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#0D3B8E] to-[#1E56B3] text-lg text-white">
                      ✨
                    </span>
                    <h2 className="text-sm font-semibold text-slate-800">
                      AI Assistant
                    </h2>
                  </div>
                  <p className="mb-4 text-xs leading-relaxed text-slate-500">
                    Enter a product name above, then let AI automatically generate:
                  </p>
                  <ul className="mb-5 space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="text-[#1E56B3]">✓</span> Description
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#1E56B3]">✓</span> Brand
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#1E56B3]">✓</span> Category
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#1E56B3]">✓</span> Unit
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-[#1E56B3]">✓</span> Product Image
                    </li>
                  </ul>

                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={autoFillLoading || !form.name.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0D3B8E] to-[#1E56B3] px-4 py-3 text-sm font-medium text-white shadow-md shadow-[#0D3B8E]/20 transition hover:shadow-lg hover:shadow-[#0D3B8E]/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {autoFillLoading ? (
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
                    ) : (
                      <span>✨</span>
                    )}
                    {autoFillLoading ? "Filling…" : "Auto Fill Details"}
                  </button>
                  {autoFillError && (
                    <p className="mt-2.5 text-xs text-amber-600">{autoFillError}</p>
                  )}
                </div>
              </div>

              {/* Image Preview */}
              <div className={cardBase}>
                <div className="px-6 py-6">
                  <h2 className={sectionLabel}>Product Image</h2>
                  <div className="mb-4 flex items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-[#F5F8FD]">
                    {form.image_url ? (
                      <img
                        src={form.image_url}
                        alt="Preview"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display = "none")
                        }
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-48 w-full flex-col items-center justify-center gap-2 text-slate-300">
                        <svg
                          width="36"
                          height="36"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
                          <path
                            d="M21 15l-5-5L5 21"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-xs">No image yet</span>
                      </div>
                    )}
                  </div>
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
                </div>
              </div>

              {/* Product Status */}
              <div className={cardBase}>
                <div className="px-6 py-6">
                  <h2 className={sectionLabel}>Product Status</h2>
                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 px-4 py-3.5 hover:bg-[#F5F8FD] transition">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Active</p>
                      <p className="text-xs text-slate-400">
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
                          form.is_active ? "bg-[#0D3B8E]" : "bg-slate-200"
                        }`}
                      />
                      <div
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          form.is_active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>

                  {submitError && (
                    <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {submitError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur-md shadow-[0_-4px_20px_rgba(13,59,142,0.08)]">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#0D3B8E] to-[#1E56B3] px-6 py-2.5 text-sm font-medium text-white shadow-md shadow-[#0D3B8E]/20 transition hover:shadow-lg hover:shadow-[#0D3B8E]/30 disabled:opacity-60 disabled:cursor-not-allowed"
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
  );
}