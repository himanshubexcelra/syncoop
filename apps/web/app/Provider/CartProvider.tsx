"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { CartModel } from '@/lib/definition';
import { ProductModel } from '@/lib/definition';
import { CartContextModel } from '@/lib/definition';


// Define the type for the props of the provider
type CartProviderProps = {
  children: ReactNode;
};

const defaultCartContext: CartContextModel = {
  cart: [],
  addToCart: () => { },
  removeFromCart: () => { },
  clearCart: () => { },
};



// cart context initialize
const CartContext = createContext<CartContextModel>(defaultCartContext);

// cart context hooks use
export const useCart = (): CartContextModel => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("Error");
  }
  return context;
};

// CartProvider with the correct type for children
export const CartContextProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<ProductModel[]>([]);

  const addToCart = (product: ProductModel) => {
    setCart(prevCart => [...prevCart, product]);

  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };



  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
