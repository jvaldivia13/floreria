import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const shipping = items.length > 0 ? 20 : 0;
    setTotal(subtotal + shipping);
  }, [items]);

  const addItem = (product, cantidad = 1) => {
    const existing = items.find(item => item.id === product.id);
    if (existing) {
      setItems(items.map(item =>
        item.id === product.id
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
    } else {
      setItems([...items, { ...product, cantidad }]);
    }
  };

  const removeItem = (productId) => {
    setItems(items.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, cantidad) => {
    if (cantidad < 1) {
      removeItem(productId);
    } else {
      setItems(items.map(item =>
        item.id === productId
          ? { ...item, cantidad }
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
