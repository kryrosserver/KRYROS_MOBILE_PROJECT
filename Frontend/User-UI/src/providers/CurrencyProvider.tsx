"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type Country = {
  id: string;
  name: string;
  code: string;
  currencyCode: string;
  currencySymbol: string;
  symbolPosition: "BEFORE" | "AFTER";
  exchangeRate: number;
  flag?: string;
  isDefault: boolean;
  paymentMethods: any[];
};

interface CurrencyContextType {
  countries: Country[];
  selectedCountry: Country | null;
  setCountry: (code: string) => void;
  convertPrice: (usdPrice: number) => { amount: number; formatted: string; isZambia: boolean };
  formatLocal: (amount: number) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://kryrosbackend-d68q.onrender.com/api";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCountries = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/countries`);
      if (!res.ok) throw new Error("Failed to fetch countries");
      const data = await res.json();
      setCountries(data);

      // Initialize selected country from localStorage or default
      const savedCode = localStorage.getItem("selected_country_code");
      const defaultCountry = data.find((c: Country) => c.isDefault) || data[0];
      const initial = data.find((c: Country) => c.code === savedCode) || defaultCountry;
      
      setSelectedCountry(initial);
    } catch (error) {
      console.error("CurrencyProvider: Error fetching countries", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
  }, [fetchCountries]);

  const setCountry = (code: string) => {
    const country = countries.find(c => c.code === code);
    if (country) {
      setSelectedCountry(country);
      localStorage.setItem("selected_country_code", code);
      // Optional: window.location.reload() to ensure all components update correctly
    }
  };

  const convertPrice = useCallback((usdPrice: number) => {
    if (!selectedCountry) return { amount: usdPrice, formatted: `$${usdPrice}`, isZambia: false };

    let localAmount = usdPrice * Number(selectedCountry.exchangeRate);
    const isZambia = selectedCountry.code === "ZM" || selectedCountry.currencyCode === "ZMW";

    // Zambia Special Rule: No decimals, round to nearest 10
    if (isZambia) {
      localAmount = Math.ceil(localAmount / 10) * 10;
    }

    const formatted = formatLocal(localAmount);
    return { amount: localAmount, formatted, isZambia };
  }, [selectedCountry]);

  const formatLocal = useCallback((amount: number) => {
    if (!selectedCountry) return `$${amount}`;

    const isZambia = selectedCountry.code === "ZM" || selectedCountry.currencyCode === "ZMW";
    const formattedAmount = isZambia 
      ? amount.toLocaleString('en-US') // No decimals for ZMW
      : amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (selectedCountry.symbolPosition === "BEFORE") {
      return `${selectedCountry.currencySymbol} ${formattedAmount}`;
    } else {
      return `${formattedAmount} ${selectedCountry.currencySymbol}`;
    }
  }, [selectedCountry]);

  return (
    <CurrencyContext.Provider value={{ 
      countries, 
      selectedCountry, 
      setCountry, 
      convertPrice, 
      formatLocal,
      isLoading 
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
