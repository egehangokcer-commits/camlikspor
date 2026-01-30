"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  dealerSlug: string | null;
  setDealerSlug: (slug: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "shop-cart";

interface CartState {
  dealerSlug: string | null;
  items: CartItem[];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartState, setCartState] = useState<CartState>({
    dealerSlug: null,
    items: [],
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartState;
        setCartState(parsed);
      } catch {
        // Invalid stored cart, ignore
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    if (cartState.items.length > 0 || cartState.dealerSlug) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
    }
  }, [cartState]);

  const setDealerSlug = useCallback((slug: string) => {
    setCartState((prev) => {
      // If dealer changed, clear cart
      if (prev.dealerSlug && prev.dealerSlug !== slug) {
        return { dealerSlug: slug, items: [] };
      }
      return { ...prev, dealerSlug: slug };
    });
  }, []);

  const addItem = useCallback((item: CartItem) => {
    setCartState((prev) => {
      const existingIndex = prev.items.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        const newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + item.quantity,
        };
        return { ...prev, items: newItems };
      }

      // Add new item
      return { ...prev, items: [...prev.items, item] };
    });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    setCartState((prev) => ({
      ...prev,
      items: prev.items.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      ),
    }));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }

      setCartState((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.productId === productId && i.variantId === variantId
            ? { ...i, quantity }
            : i
        ),
      }));
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setCartState((prev) => ({ ...prev, items: [] }));
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const totalItems = cartState.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartState.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: cartState.items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        dealerSlug: cartState.dealerSlug,
        setDealerSlug,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
