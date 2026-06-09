"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  category_id: number;
  price: number;
  image_url: string | null;
  stock_qty: number;
  is_active: boolean;
  category?: Category;
}

type StockFilter = "All" | "In Stock" | "Out of Stock";

function getStatus(stock_qty: number): "In Stock" | "Out of Stock" {
  return stock_qty > 0 ? "In Stock" : "Out of Stock";
}

const STATUS_STYLES = {
  "In Stock":     { bg: "#EEF6F2", color: "#2D6A4F", dot: "#2D6A4F" },
  "Out of Stock": { bg: "#FBF0F0", color: "#9B4343", dot: "#9B4343" },
};

function ProductImage({ url, name }: { url: string | null; name: string }) {
  const [error, setError] = useState(false);

  if (!url || error) {
    return (
      <div style={{
        width: 40, height: 40, borderRadius: 10, background: "#F0EEE8",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 18, flexShrink: 0,
      }}>
        🛒
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={name}
      onError={() => setError(true)}
      style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid #E8E6DF" }}
    />
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState<StockFilter>("All");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch categories
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("id, name")
          .order("name");

        if (catError) throw new Error(catError.message);

        const catMap: Record<number, string> = {};
        (catData ?? []).forEach((c: Category) => { catMap[c.id] = c.name; });
        setCategories(catMap);

        // Fetch products
        const { data: prodData, error: prodError } = await supabase
          .from("products")
          .select("id, name, category_id, price, image_url, stock_qty, is_active")
          .order("name");

        if (prodError) throw new Error(prodError.message);

        setProducts(prodData ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const uniqueCategories = useMemo(() => {
    const names = Object.values(categories);
    return ["All", ...Array.from(new Set(names)).sort()];
  }, [categories]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const catName = categories[p.category_id] ?? "";
      const matchCat = categoryFilter === "All" || catName === categoryFilter;
      const status = getStatus(p.stock_qty);
      const matchStock = stockFilter === "All" || status === stockFilter;
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter, categories]);

  const inStockCount = products.filter((p) => p.stock_qty > 0).length;
  const outOfStockCount = products.filter((p) => p.stock_qty === 0).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        .products-root { font-family: 'DM Sans', sans-serif; }

        .search-input {
          background: #FAFAF7; border: 1px solid #E8E6DF; border-radius: 10px;
          padding: 9px 14px 9px 38px; font-size: 13.5px; color: #1a1a14;
          outline: none; width: 100%; font-family: 'DM Sans', sans-serif;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .search-input::placeholder { color: #b0ae9f; }
        .search-input:focus { border-color: #2D6A4F; box-shadow: 0 0 0 3px rgba(45,106,79,0.1); }

        .filter-select {
          background: #FAFAF7; border: 1px solid #E8E6DF; border-radius: 10px;
          padding: 9px 12px; font-size: 13px; color: #3a3a2e;
          font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer;
          transition: border-color 0.15s;
        }
        .filter-select:focus { border-color: #2D6A4F; }

        .add-btn {
          display: flex; align-items: center; gap: 7px;
          background: #2D6A4F; color: #fff; border: none; border-radius: 10px;
          padding: 9px 18px; font-size: 13.5px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; cursor: pointer;
          transition: background 0.17s, transform 0.15s;
          white-space: nowrap; letter-spacing: -0.01em;
        }
        .add-btn:hover { background: #225239; transform: translateY(-1px); }

        .chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px; border-radius: 20px; font-size: 11.5px;
          font-weight: 500; cursor: pointer; border: 1px solid transparent;
          transition: all 0.14s; font-family: 'DM Mono', monospace; letter-spacing: 0.02em;
        }

        .table-wrap {
          overflow-x: auto; border-radius: 14px;
          border: 1px solid #E8E6DF; background: #FAFAF7;
        }
        table { width: 100%; border-collapse: collapse; min-width: 600px; }
        thead th {
          padding: 12px 16px; text-align: left;
          font-family: 'DM Mono', monospace; font-size: 10px;
          font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase;
          color: #a0a090; background: #F5F4F0; border-bottom: 1px solid #E8E6DF;
        }
        thead th:first-child { border-radius: 14px 0 0 0; }
        thead th:last-child  { border-radius: 0 14px 0 0; }
        tbody tr { border-bottom: 1px solid #F0EEE8; transition: background 0.12s; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #F5F4F0; }
        tbody td { padding: 13px 16px; font-size: 13.5px; color: #1a1a14; vertical-align: middle; }

        .status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 500;
        }

        .edit-btn {
          background: none; border: 1px solid #E8E6DF; border-radius: 7px;
          padding: 5px 11px; font-size: 12px; font-weight: 500; color: #7c7c72;
          font-family: 'DM Sans', sans-serif; cursor: pointer; transition: all 0.14s;
        }
        .edit-btn:hover { background: #ECEAE4; color: #1a1a14; border-color: #D5D2C8; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .skeleton {
          background: #ECEAE4; border-radius: 6px;
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="products-root max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-6">
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "0.09em", color: "#a0a090", textTransform: "uppercase", marginBottom: 4 }}>
            Inventory
          </p>
          <h1 style={{ fontSize: "clamp(20px, 3.5vw, 28px)", fontWeight: 600, color: "#1a1a14", letterSpacing: "-0.03em" }}>
            Products
          </h1>
        </div>

        {/* Error state */}
        {error && (
          <div style={{
            background: "#FBF0F0", border: "1px solid #F5D8D8", borderRadius: 12,
            padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#9B4343" strokeWidth={1.8} style={{ width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: "#9B4343", marginBottom: 2 }}>Failed to load products</p>
              <p style={{ fontSize: 12.5, color: "#b05050" }}>{error}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{ marginLeft: "auto", fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#9B4343", background: "none", border: "1px solid #F5D8D8", borderRadius: 7, padding: "4px 10px", cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary chips */}
        {!loading && !error && (
          <div className="flex flex-wrap gap-2 mb-5">
            {([
              { label: "All", count: products.length, dot: "#b0ae9f", bg: "#ECEAE4", color: "#3a3a2e" },
              { label: "In Stock", count: inStockCount, ...STATUS_STYLES["In Stock"] },
              { label: "Out of Stock", count: outOfStockCount, ...STATUS_STYLES["Out of Stock"] },
            ] as const).map(({ label, count, dot, bg, color }) => {
              const active = stockFilter === label;
              return (
                <button
                  key={label}
                  className="chip"
                  onClick={() => setStockFilter(label as StockFilter)}
                  style={{
                    background: active ? bg : "#F5F4F0",
                    color: active ? color : "#7c7c72",
                    borderColor: active ? bg : "#E8E6DF",
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: active ? dot : "#c0beb0", display: "inline-block" }} />
                  {label} · {count}
                </button>
              );
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div style={{ position: "relative", flex: 1 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}
              style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "#b0ae9f", pointerEvents: "none" }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
          </div>

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            disabled={loading}
          >
            {uniqueCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

        </div>

        {/* Table */}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Availability</th>
                <th>Active</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Loading skeletons */}
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0 }} />
                      <div className="skeleton" style={{ height: 13, width: "60%", borderRadius: 4 }} />
                    </div>
                  </td>
                  {[80, 55, 50, 80, 45, 55].map((w, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 13, width: w, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))}

              {/* Empty state */}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div style={{ textAlign: "center", padding: "52px 24px", color: "#a0a090" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}
                        style={{ width: 36, height: 36, margin: "0 auto 12px", color: "#D5D2C8" }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#7c7c72" }}>No products found</p>
                      <p style={{ fontSize: 12, marginTop: 4 }}>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loading && !error && filtered.map((product) => {
                const status = getStatus(product.stock_qty);
                const s = STATUS_STYLES[status];
                const catName = categories[product.category_id] ?? "—";

                return (
                  <tr key={product.id}>
                    {/* Product */}
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <ProductImage url={product.image_url} name={product.name} />
                        <span style={{ fontWeight: 500, fontSize: 13.5 }}>{product.name}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, color: "#7c7c72", background: "#F0EEE8", padding: "2px 8px", borderRadius: 6 }}>
                        {catName}
                      </span>
                    </td>

                    {/* Price */}
                    <td>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500 }}>
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </td>

                    {/* Stock */}
                    <td>
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
                        color: product.stock_qty === 0 ? "#9B4343" : product.stock_qty < 10 ? "#9B6A1A" : "#1a1a14",
                      }}>
                        {product.stock_qty}
                      </span>
                      <span style={{ fontSize: 11, color: "#b0ae9f", marginLeft: 3 }}>units</span>
                    </td>

                    {/* Availability */}
                    <td>
                      <span className="status-badge" style={{ background: s.bg, color: s.color }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
                        {status}
                      </span>
                    </td>

                    {/* Active */}
                    <td>
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 11,
                        padding: "2px 8px", borderRadius: 6,
                        background: product.is_active ? "#EEF6F2" : "#F5F4F0",
                        color: product.is_active ? "#2D6A4F" : "#a0a090",
                      }}>
                        {product.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: "right" }}>
                      <button className="edit-btn">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!loading && !error && (
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-1">
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#a0a090" }}>
              Showing {filtered.length} of {products.length} products
            </p>
            {(search || categoryFilter !== "All" || stockFilter !== "All") && (
              <button
                onClick={() => { setSearch(""); setCategoryFilter("All"); setStockFilter("All"); }}
                style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#2D6A4F", background: "none", border: "none", cursor: "pointer" }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
}