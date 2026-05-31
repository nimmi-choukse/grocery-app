/** MVP checkout — cash on delivery only (no online payment yet). */
export const PAYMENT_METHOD_COD = "cod" as const;

export type PaymentMethod = typeof PAYMENT_METHOD_COD;

/** Snapshot of product data at add-to-cart time (no live DB sync). */
export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  unit: string | null;
  quantity: number;
  /** Max purchasable units; `null` means no stock cap enforced. */
  maxQuantity: number | null;
};

export type CartItemsMap = Record<string, CartItem>;

/** Payload when adding a product from the catalog. */
export type AddToCartInput = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  unit: string | null;
  stockQty: number | null;
};

export type CartTotals = {
  totalItems: number;
  totalPrice: number;
};
