"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";

type AutoFillResult = {
  description: string;
  category: string;
  brand: string;
  unit: string;
};

export function AutoFillDetailsButton({
  productName,
  onFilled,
  onError,
  className = "",
}: {
  /** Current value of the Product Name field. */
  productName: string;
  /** Called with the AI-generated fields once the request succeeds. */
  onFilled: (result: AutoFillResult) => void;
  /** Optional — called with a message if validation or the request fails.
   *  If omitted, the component shows its own inline error text. */
  onError?: (message: string) => void;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleClick() {
    setLocalError(null);

    const trimmedName = productName.trim();
    if (!trimmedName) {
      const message = "Enter a product name first.";
      if (onError) {
        onError(message);
      } else {
        setLocalError(message);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products/auto-fill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: trimmedName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Unable to generate details. Please try again.");
      }

      onFilled(data as AutoFillResult);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to generate details. Please try again.";
      if (onError) {
        onError(message);
      } else {
        setLocalError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-[#0D3B8E] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-[#1E56B3] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.25} />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" strokeWidth={2.25} />
            Auto Fill Details
          </>
        )}
      </button>
      {!onError && localError && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{localError}</p>
      )}
    </div>
  );
}