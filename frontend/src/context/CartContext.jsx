import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = items.length > 0 ? 20 : 0;
    setTotal(subtotal + shipping);
  }, [items]);

  const addItem = (product, quantity = 1) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image_url: product.image_url,
      quantity: quantity
    };

    const existing = items.find(item => item.id === product.id);
    if (existing) {
      setItems(items.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setItems([...items, cartItem]);
    }
  };

  const removeItem = (productId) => {
    setItems(items.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeItem(productId);
    } else {
      setItems(items.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ items, total, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
