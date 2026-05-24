import React, {createContext, useContext, useMemo, useState} from 'react';

import type {CartItemModel, Item} from '../types/models.ts';

interface CartContextType {
  cartItems: CartItemModel[];
  totalQuantity: number;
  totalValue: number;

  addToCart: (item: Item, quantity?: number) => void;
  removeFromCart: (idItem: number) => void;
  updateQuantity: (idItem: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
}

export function CartProvider({
  children,
}: CartProviderProps): React.JSX.Element {
  const [cartItems, setCartItems] = useState<CartItemModel[]>([]);

  const addToCart = (item: Item, quantity = 1): void => {
    if (quantity <= 0) {
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
          const availableQuantity = item.quantity ?? 0;
          const nextQuantity = Math.min(
            currentQuantity + quantity,
            availableQuantity,
          );

          return {
            ...cartItem,
            quantity: nextQuantity,
          };
        });
      }

      const availableQuantity = item.quantity ?? 0;
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
  };

  const removeFromCart = (idItem: number): void => {
    setCartItems(previousItems =>
      previousItems.filter(cartItem => cartItem.item.idItem !== idItem),
    );
  };

  const updateQuantity = (idItem: number, quantity: number): void => {
    if (quantity <= 0) {
      removeFromCart(idItem);
      return;
    }

    setCartItems(previousItems =>
      previousItems.map(cartItem => {
        if (cartItem.item.idItem !== idItem) {
          return cartItem;
        }

        const availableQuantity = cartItem.item.quantity ?? 0;
        const safeQuantity = Math.min(quantity, availableQuantity);

        return {
          ...cartItem,
          quantity: safeQuantity,
        };
      }),
    );
  };

  const clearCart = (): void => {
    setCartItems([]);
  };

  const totalQuantity = useMemo(() => {
    return cartItems.reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  }, [cartItems]);

  const totalValue = useMemo(() => {
    return cartItems.reduce((sum, cartItem) => {
      return sum + cartItem.quantity * (cartItem.item.price ?? 0);
    }, 0);
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalQuantity,
        totalValue,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}