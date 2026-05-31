import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AddToCartInput,
  CartItem,
  CartItemsMap,
  CartTotals,
} from "@/types/cart";

const CART_STORAGE_KEY = "freshkart-cart-v1";

type CartState = {
  items: CartItemsMap;
};

type CartActions = {
  addItem: (input: AddToCartInput) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
};

export type CartStore = CartState & CartActions;

function normalizePrice(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function normalizeQuantity(value: unknown): number {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function normalizeCartItem(item: CartItem): CartItem {
  return {
    ...item,
    price: normalizePrice(item.price),
    quantity: normalizeQuantity(item.quantity),
  };
}

function normalizeItemsMap(items: CartItemsMap): CartItemsMap {
  const next: CartItemsMap = {};
  for (const [id, item] of Object.entries(items)) {
    const normalized = normalizeCartItem(item);
    if (normalized.quantity > 0) {
      next[id] = normalized;
    }
  }
  return next;
}

function buildCartItem(input: AddToCartInput, quantity: number): CartItem {
  return normalizeCartItem({
    productId: input.productId,
    name: input.name,
    slug: input.slug,
    price: input.price,
    imageUrl: input.imageUrl,
    unit: input.unit,
    quantity,
    maxQuantity:
      input.stockQty !== null && input.stockQty >= 0 ? input.stockQty : null,
  });
}

function clampQuantity(item: CartItem, nextQty: number): number {
  const qty = normalizeQuantity(nextQty);
  if (qty <= 0) return 0;
  if (item.maxQuantity !== null) {
    return Math.min(qty, item.maxQuantity);
  }
  return qty;
}

/** Single source of truth for line totals (price × quantity). */
export function getLineTotal(item: CartItem): number {
  const price = normalizePrice(item.price);
  const quantity = normalizeQuantity(item.quantity);
  return price * quantity;
}

export function getCartTotals(items: CartItemsMap): CartTotals {
  const normalized = normalizeItemsMap(items);
  return Object.values(normalized).reduce(
    (acc, item) => ({
      totalItems: acc.totalItems + normalizeQuantity(item.quantity),
      totalPrice: acc.totalPrice + getLineTotal(item),
    }),
    { totalItems: 0, totalPrice: 0 },
  );
}

export const selectCartItems = (state: CartStore): CartItem[] =>
  Object.values(normalizeItemsMap(state.items));

export const selectTotalItems = (state: CartStore): number =>
  getCartTotals(state.items).totalItems;

export const selectTotalPrice = (state: CartStore): number =>
  getCartTotals(state.items).totalPrice;

export const selectItemQuantity =
  (productId: string) =>
  (state: CartStore): number =>
    normalizeQuantity(state.items[productId]?.quantity ?? 0);

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: {},

      addItem: (input) => {
        set((state) => {
          const existing = state.items[input.productId];
          const draft = existing ?? buildCartItem(input, 0);
          const currentQty = normalizeQuantity(draft.quantity);
          const nextQty = clampQuantity(draft, currentQty + 1);

          if (nextQty <= 0) return state;
          if (existing && nextQty === currentQty) return state;

          const nextItem = existing
            ? normalizeCartItem({ ...existing, quantity: nextQty })
            : buildCartItem(input, nextQty);

          return {
            items: {
              ...state.items,
              [input.productId]: nextItem,
            },
          };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          if (!state.items[productId]) return state;
          const next = { ...state.items };
          delete next[productId];
          return { items: next };
        });
      },

      increaseQuantity: (productId) => {
        set((state) => {
          const item = state.items[productId];
          if (!item) return state;

          const currentQty = normalizeQuantity(item.quantity);
          const nextQty = clampQuantity(item, currentQty + 1);
          if (nextQty <= 0 || nextQty === currentQty) return state;

          return {
            items: {
              ...state.items,
              [productId]: normalizeCartItem({ ...item, quantity: nextQty }),
            },
          };
        });
      },

      decreaseQuantity: (productId) => {
        set((state) => {
          const item = state.items[productId];
          if (!item) return state;

          const currentQty = normalizeQuantity(item.quantity);
          const nextQty = currentQty - 1;

          if (nextQty <= 0) {
            const next = { ...state.items };
            delete next[productId];
            return { items: next };
          }

          return {
            items: {
              ...state.items,
              [productId]: normalizeCartItem({ ...item, quantity: nextQty }),
            },
          };
        });
      },

      clearCart: () => set({ items: {} }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => ({
        ...current,
        items: normalizeItemsMap(
          (persisted as CartState | undefined)?.items ?? {},
        ),
      }),
    },
  ),
);
