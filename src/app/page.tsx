"use client";



import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import {
  getLineTotal,
  useCartStore,
} from "@/store/cartStore";
import type { AddToCartInput } from "@/types/cart";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";

/* -------------------------------------------------------------------------- */
/* Types (matches live Supabase schema)                                       */
/* -------------------------------------------------------------------------- */

type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price: number | null;
  compare_price: number | null;
  unit: string | null;
  stock_qty: number | null;
  is_active: boolean;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number | null;
};

type StockStatus = "in" | "low" | "out" | "unknown";

function getStockStatus(qty: number | null): StockStatus {
  if (qty === null || qty === undefined) return "unknown";
  if (qty <= 0) return "out";
  if (qty <= 10) return "low";
  return "in";
}

const STOCK_BADGE: Record<
  StockStatus,
  { label: string; className: string }
> = {
  in: {
    label: "In Stock",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  low: {
    label: "Low Stock",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  out: {
    label: "Out of Stock",
    className: "bg-red-50 text-red-700 ring-red-600/20",
  },
  unknown: {
    label: "Check availability",
    className: "bg-zinc-100 text-zinc-600 ring-zinc-400/20",
  },
};

const PRODUCT_SELECT =
  "id, category_id, name, slug, description, image_url, price, compare_price, unit, stock_qty, is_active";

function formatPrice(price: number | null) {
  if (price === null || price === undefined) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

function categoryEmoji(name: string) {
  const n = name.toLowerCase();
  if (n.includes("fruit") || n.includes("vegetable")) return "🥬";
  if (n.includes("dairy") || n.includes("egg")) return "🥛";
  if (n.includes("grain") || n.includes("pulse")) return "🌾";
  if (n.includes("snack") || n.includes("beverage")) return "🍿";
  return "🛒";
}

function productToCartInput(product: Product): AddToCartInput | null {
  if (product.price === null) return null;
  return {
    productId: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    imageUrl: product.image_url,
    unit: product.unit,
    stockQty: product.stock_qty,
  };
}

/* -------------------------------------------------------------------------- */
/* UI components                                                              */
/* -------------------------------------------------------------------------- */

function StockBadge({ quantity }: { quantity: number | null }) {
  const status = getStockStatus(quantity);
  const { label, className } = STOCK_BADGE[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}

function ProductImage({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  if (imageUrl) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-zinc-50 to-zinc-100 p-3 text-center">
      <span className="text-3xl" aria-hidden>
        📦
      </span>
      <span className="text-[10px] font-medium text-zinc-400">No image</span>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const quantity = useCartStore((s) => s.items[product.id]?.quantity ?? 0);
  const addItem = useCartStore((s) => s.addItem);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);

  const status = getStockStatus(product.stock_qty);
  const outOfStock = status === "out";
  const noPrice = product.price === null;
  const cartInput = productToCartInput(product);
  const canPurchase = !outOfStock && !noPrice && cartInput !== null;

  const priceLabel = formatPrice(product.price);
  const compareLabel = formatPrice(product.compare_price);

  function handleAdd() {
    if (!cartInput) return;
    addItem(cartInput);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="relative mb-3">
        <ProductImage name={product.name} imageUrl={product.image_url} />
        <div className="absolute left-2 top-2">
          <StockBadge quantity={product.stock_qty} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-zinc-900">
          {product.name}
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-xs text-zinc-500">{product.description}</p>
        )}
        <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          {product.slug}
          {product.unit ? ` · ${product.unit}` : ""}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          {priceLabel ? (
            <>
              <p className="text-base font-bold text-zinc-900">{priceLabel}</p>
              {compareLabel &&
                product.compare_price != null &&
                product.price != null &&
                product.compare_price > product.price && (
                  <p className="text-xs text-zinc-400 line-through">{compareLabel}</p>
                )}
            </>
          ) : (
            <p className="text-sm font-medium text-zinc-500">Price coming soon</p>
          )}
        </div>
      </div>

      {quantity > 0 ? (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#0c831f]/30 bg-emerald-50 p-1">
          <button
            type="button"
            onClick={() => decreaseQuantity(product.id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg font-bold text-[#0c831f] shadow-sm transition-colors hover:bg-emerald-100"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-[2ch] text-center text-sm font-bold text-[#0c831f]">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => increaseQuantity(product.id)}
            disabled={
              product.stock_qty !== null && quantity >= product.stock_qty
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0c831f] text-lg font-bold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={!canPurchase}
          onClick={handleAdd}
          className={`mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
            !canPurchase
              ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
              : "bg-[#0c831f] text-white hover:bg-emerald-700 active:scale-[0.98]"
          }`}
        >
          {outOfStock ? "Unavailable" : noPrice ? "No price" : "ADD"}
        </button>
      )}
    </article>
  );
}

function CartPanelContent({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const itemsMap = useCartStore((state) => state.items);
const items = Object.values(itemsMap);

const totalItems = items.reduce(
  (sum, item) => sum + item.quantity,
  0
);

const totalPrice = items.reduce(
  (sum, item) => sum + item.price * item.quantity,
  0
);
  const increaseQuantity = useCartStore((s) => s.increaseQuantity);
  const decreaseQuantity = useCartStore((s) => s.decreaseQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px]"
        aria-label="Close cart"
        onClick={onClose}
      />
      <aside className="fixed bottom-0 right-0 top-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl sm:rounded-l-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Your cart</h2>
            <p className="text-xs text-zinc-500">
              {totalItems} item{totalItems !== 1 ? "s" : ""} · Pay on delivery
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl">🛒</span>
              <p className="mt-3 font-semibold text-zinc-800">Cart is empty</p>
              <p className="mt-1 text-sm text-zinc-500">Add groceries to get started</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.productId}
                  className="flex gap-3 rounded-xl border border-zinc-100 p-3"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-zinc-50 text-xl">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full rounded-lg object-contain p-1"
                      />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      {item.name}
                    </p>
                    {item.unit && (
                      <p className="text-xs text-zinc-500">{item.unit}</p>
                    )}
                    <p className="mt-0.5 text-sm font-bold text-zinc-900">
                      {formatPrice(getLineTotal(item))}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item.productId)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-sm font-bold hover:bg-zinc-50"
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => increaseQuantity(item.productId)}
                        disabled={
                          item.maxQuantity !== null &&
                          item.quantity >= item.maxQuantity
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0c831f] text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-40"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
  <div className="border-t border-zinc-100 p-4">
    <div className="mb-3 flex items-center justify-between text-sm">
      <span className="text-zinc-600">Subtotal</span>
      <span className="text-lg font-bold text-zinc-900">
        {formatPrice(totalPrice)}
      </span>
    </div>

    <p className="mb-3 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400">
      Cash on delivery · MVP
    </p>

    <button
      type="button"
      onClick={() => router.push("/checkout")}
      className="w-full rounded-xl bg-[#0c831f] py-3 text-sm font-bold text-white hover:bg-emerald-700"
    >
      Place order (COD)
    </button>
  </div>
)}
</aside>
    </>
  );
}

function CartPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return <CartPanelContent onClose={onClose} />;
}

function HomepageSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
          <div className="h-8 w-28 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-10 flex-1 animate-pulse rounded-xl bg-zinc-100" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-6">
        <div className="h-40 animate-pulse rounded-2xl bg-zinc-200" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-zinc-200" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-zinc-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
        <span className="text-4xl" aria-hidden>
          ⚠️
        </span>
        <h1 className="mt-4 text-xl font-bold text-zinc-900">
          Could not load products
        </h1>
        <p className="mt-2 text-sm text-zinc-600">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex rounded-xl bg-[#0c831f] px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
      <span className="text-5xl" aria-hidden>
        🛒
      </span>
      <h2 className="mt-4 text-lg font-bold text-zinc-900">No products yet</h2>
      <p className="mt-2 text-sm text-zinc-500">
        Active products from your Supabase catalog will appear here.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [cartOpen, setCartOpen] = useState(false);
  const itemsMap = useCartStore((state) => state.items);

const totalItems = Object.values(itemsMap).reduce(
  (sum, item) => sum + item.quantity,
  0
);
  const handleCloseCart = useCallback(() => setCartOpen(false), []);
  const handleOpenCart = useCallback(() => setCartOpen(true), []);

  useEffect(() => {
    console.log("HOME USEEFFECT RUNNING");
    let cancelled = false;

    async function loadCatalog() {
      console.log("LOAD START");
    
      setLoading(true);
      setError(null);
    
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          supabase
            .from("products")
            .select(PRODUCT_SELECT)
            .eq("is_active", true)
            .order("name", { ascending: true }),
    
          supabase
            .from("categories")
            .select("id, name, slug, image_url, sort_order")
            .order("sort_order", { ascending: true }),
        ]);
    
        console.log("PRODUCT ERROR", productsRes.error);
        console.log("CATEGORY ERROR", categoriesRes.error);
    
        console.log("PRODUCT COUNT", productsRes.data?.length);
        console.log("CATEGORY COUNT", categoriesRes.data?.length);
    
        setProducts(productsRes.data ?? []);
        setCategories(categoriesRes.data ?? []);
      } catch (err) {
        console.error("LOAD FAILED", err);
      } finally {
        console.log("LOAD END");
        setLoading(false);
      }
    }
    loadCatalog();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = products;

    if (selectedCategoryId) {
      list = list.filter((p) => p.category_id === selectedCategoryId);
    }

    const q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false) ||
        (p.unit?.toLowerCase().includes(q) ?? false),
    );
  }, [products, query, selectedCategoryId]);

  const featured = useMemo(() => {
    const inStock = products.filter((p) => (p.stock_qty ?? 0) > 0);
    const pool = inStock.length > 0 ? inStock : products;
    return pool.slice(0, 6);
  }, [products]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  if (loading) return <HomepageSkeleton />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-14 items-center gap-3 sm:h-16">
            <a href="/" className="flex shrink-0 items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c831f] text-lg text-white shadow-sm">
                🥬
              </span>
              <div className="hidden leading-tight sm:block">
                <p className="text-base font-extrabold tracking-tight text-[#0c831f]">
                  FreshKart
                </p>
                <p className="text-[10px] font-medium text-zinc-500">
                  Groceries in minutes
                </p>
              </div>
            </a>

            <div className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
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
                    d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                  />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, slug, or description…"
                className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-[#0c831f] focus:bg-white focus:ring-2 focus:ring-[#0c831f]/20 sm:h-11"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenCart}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-lg transition-colors hover:border-[#0c831f]/40 hover:bg-emerald-50 sm:h-11 sm:w-11"
              aria-label={`Cart, ${totalItems} items`}
            >
              🛒
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0c831f] px-1 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-5 sm:py-7">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c831f] via-emerald-600 to-lime-500 p-5 text-white shadow-lg sm:p-8">
          <div className="relative z-10 max-w-lg">
            <p className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              ⚡ Delivery in 10 minutes
            </p>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
              India&apos;s last minute app
            </h1>
            <p className="mt-2 text-sm text-emerald-50 sm:text-base">
              Fresh groceries, daily essentials &amp; more — delivered to your
              door.
            </p>
            <button
              type="button"
              className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#0c831f] shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Shop now
            </button>
          </div>
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-white/10 blur-2xl sm:h-56 sm:w-56"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-10 right-8 text-7xl opacity-90 sm:text-8xl"
            aria-hidden
          >
            🥑
          </div>
        </section>

        {categories.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-zinc-900">
                Shop by category
              </h2>
              {selectedCategoryId && (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="text-xs font-semibold text-[#0c831f] hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const active = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategoryId(active ? null : cat.id)
                    }
                    className={`flex min-w-[7.5rem] shrink-0 flex-col items-center gap-2 rounded-2xl border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] ${
                      active
                        ? "border-[#0c831f] bg-emerald-50 shadow-sm"
                        : "border-zinc-100 bg-white hover:border-emerald-200"
                    }`}
                  >
                    <span className="text-2xl">{categoryEmoji(cat.name)}</span>
                    <span className="text-center text-xs font-semibold leading-tight text-zinc-800">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {featured.length > 0 && !query && !selectedCategoryId && (
              <section>
                <div className="mb-4 flex items-end justify-between">
                  <h2 className="text-lg font-bold text-zinc-900">
                    Featured for you
                  </h2>
                  <span className="text-xs font-medium text-zinc-500">
                    Top picks
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {featured.map((product) => (
                    <ProductCard
                      key={`featured-${product.id}`}
                      product={product}
                    />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
                <h2 className="text-lg font-bold text-zinc-900">
                  {query
                    ? "Search results"
                    : selectedCategory
                      ? selectedCategory.name
                      : "All products"}
                </h2>
                <span className="text-xs font-medium text-zinc-500">
                  {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-zinc-100 bg-white px-6 py-12 text-center">
                  <p className="text-4xl" aria-hidden>
                    🔍
                  </p>
                  <p className="mt-3 font-semibold text-zinc-800">
                    {query
                      ? `No products match "${query}"`
                      : "No products in this category"}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSelectedCategoryId(null);
                    }}
                    className="mt-4 text-sm font-semibold text-[#0c831f] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-4">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} FreshKart · Fast grocery delivery
      </footer>

       <CartPanel open={cartOpen} onClose={handleCloseCart} />
    </div>
  );
}
