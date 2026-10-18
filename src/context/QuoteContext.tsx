"use client";

import React, { createContext, useCallback, useContext, useRef } from "react";
import { useRouter } from "next/navigation";

interface QuoteContextType {
  /** Navigates to the request-quote page, pre-selecting the product set via setSelectedProduct. */
  openQuote: () => void;
  setSelectedProduct: (product: string) => void;
}

const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // A ref (not state) so openQuote() called right after setSelectedProduct() sees the new value.
  const selectedProduct = useRef("");

  const setSelectedProduct = useCallback((product: string) => {
    selectedProduct.current = product;
  }, []);

  const openQuote = useCallback(() => {
    const product = selectedProduct.current;
    selectedProduct.current = "";
    router.push(product ? `/request-quote?product=${encodeURIComponent(product)}` : "/request-quote");
  }, [router]);

  return (
    <QuoteContext.Provider value={{ openQuote, setSelectedProduct }}>
      {children}
    </QuoteContext.Provider>
  );
}

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuote must be used within a QuoteProvider");
  }
  return context;
}
