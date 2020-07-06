import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartList = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (cartList) {
        setProducts(JSON.parse(cartList));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const productList = products.map(prod =>
        prod.id === id ? { ...prod, quantity: prod.quantity + 1 } : prod,
      );

      setProducts(productList);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productList),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async (product: Product) => {
      const productExists = products.filter(prod => prod.id === product.id);

      if (productExists.length === 0) {
        setProducts([...products, { ...product, quantity: 1 }]);
        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(products),
        );
      } else {
        increment(product.id);
      }
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      const productList = products
        .map(prod =>
          prod.id === id ? { ...prod, quantity: prod.quantity - 1 } : prod,
        )
        .filter(product => product.quantity > 0);

      setProducts(productList);
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(productList),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
