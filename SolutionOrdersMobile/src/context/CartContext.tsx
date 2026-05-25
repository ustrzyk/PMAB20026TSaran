import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type {CartItemModel, Item} from '../types/models.ts';

interface CartContextType {
  cartItems: CartItemModel[];
  totalQuantity: number;
  totalValue: number;

  addToCart: (item: Item, quantity?: number) => void;
  removeFromCart: (idItem: number) => void;
  updateQuantity: (idItem: number, quantity: number) => void;
  clearCart: () => void;
  syncCartWithItems: (latestItems: Item[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({
  children,
}: CartProviderProps): React.JSX.Element {
  const [cartItems, setCartItems] = useState<CartItemModel[]>([]);

  const addToCart = useCallback((item: Item, quantity = 1): void => {
    if (quantity <= 0) {
      return;
    }

    if (item.isActive === false) {
      return;
    }

    const availableQuantity = item.quantity ?? 0;

    if (availableQuantity <= 0) {
      return;
    }

    setCartItems(previousItems => {
      const existingItem = previousItems.find(
        cartItem => cartItem.item.idItem === item.idItem,
      );

      if (existingItem) {
        return previousItems.map(cartItem => {
          if (cartItem.item.idItem !== item.idItem) {
            return cartItem;
          }

          const currentQuantity = cartItem.quantity;
          const nextQuantity = Math.min(
            currentQuantity + quantity,
            availableQuantity,
          );

          return {
            item,
            quantity: nextQuantity,
          };
        });
      }

      const firstQuantity = Math.min(quantity, availableQuantity);

      if (firstQuantity <= 0) {
        return previousItems;
      }

      return [
        ...previousItems,
        {
          item,
          quantity: firstQuantity,
        },
      ];
    });
  }, []);

  const removeFromCart = useCallback((idItem: number): void => {
    setCartItems(previousItems =>
      previousItems.filter(cartItem => cartItem.item.idItem !== idItem),
    );
  }, []);

  const updateQuantity = useCallback((idItem: number, quantity: number): void => {
    if (quantity <= 0) {
      setCartItems(previousItems =>
        previousItems.filter(cartItem => cartItem.item.idItem !== idItem),
      );
      return;
    }

    setCartItems(previousItems =>
      previousItems
        .map(cartItem => {
          if (cartItem.item.idItem !== idItem) {
            return cartItem;
          }

          const availableQuantity = cartItem.item.quantity ?? 0;

          if (
            cartItem.item.isActive === false ||
            availableQuantity <= 0
          ) {
            return null;
          }

          const safeQuantity = Math.min(quantity, availableQuantity);

          if (safeQuantity <= 0) {
            return null;
          }

          return {
            ...cartItem,
            quantity: safeQuantity,
          };
        })
        .filter((cartItem): cartItem is CartItemModel => cartItem !== null),
    );
  }, []);

  const clearCart = useCallback((): void => {
    setCartItems([]);
  }, []);

  const syncCartWithItems = useCallback((latestItems: Item[]): void => {
    const latestItemsMap = new Map<number, Item>();

    latestItems.forEach(item => {
      latestItemsMap.set(item.idItem, item);
    });

    setCartItems(previousItems => {
      return previousItems
        .map(cartItem => {
          const latestItem = latestItemsMap.get(cartItem.item.idItem);

          if (!latestItem) {
            return null;
          }

          if (latestItem.isActive === false) {
            return null;
          }

          const availableQuantity = latestItem.quantity ?? 0;

          if (availableQuantity <= 0) {
            return null;
          }

          const safeQuantity = Math.min(cartItem.quantity, availableQuantity);

          if (safeQuantity <= 0) {
            return null;
          }

          return {
            item: latestItem,
            quantity: safeQuantity,
          };
        })
        .filter((cartItem): cartItem is CartItemModel => cartItem !== null);
    });
  }, []);

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  }, [cartItems]);

  const totalValue = useMemo(() => {
    return cartItems.reduce((sum, cartItem) => {
      return sum + cartItem.quantity * (cartItem.item.price ?? 0);
    }, 0);
  }, [cartItems]);

  const value = useMemo<CartContextType>(() => {
    return {
      cartItems,
      totalQuantity,
      totalValue,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      syncCartWithItems,
    };
  }, [
    cartItems,
    totalQuantity,
    totalValue,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCartWithItems,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}