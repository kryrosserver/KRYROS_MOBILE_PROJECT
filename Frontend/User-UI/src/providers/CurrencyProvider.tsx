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

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://kryrosbackend-hxfp.onrender.com/api";

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
      // Force a full page reload to clear any cached price states in children
      window.location.reload();
    }
  };

  const formatLocal = useCallback((amount: number) => {
    if (!selectedCountry) return `$${amount}`;

    const currency = selectedCountry.currencyCode || 'USD';
    const isZMW = currency === "ZMW";

    // Use a localized formatter that respects the selected currency
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: isZMW ? 0 : 2,
      maximumFractionDigits: isZMW ? 0 : 2,
    }).format(amount);
  }, [selectedCountry]);

  const convertPrice = useCallback((usdPrice: number) => {
    // Handle invalid price values gracefully to prevent crashes
    const validUsdPrice = typeof usdPrice === 'number' && !isNaN(usdPrice) ? usdPrice : 0;

    if (!selectedCountry) return { amount: validUsdPrice, formatted: `$${validUsdPrice}`, isZambia: false };

    // DEBUG: Log the values to see why it's not multiplying
    const rate = typeof selectedCountry.exchangeRate === 'string' 
      ? parseFloat(selectedCountry.exchangeRate) 
      : (Number(selectedCountry.exchangeRate) || 1);
    
    // FORCE RATE TO 1.0 IF IT IS NOT ZAMBIA - THIS WAS THE HIDDEN BUG IN PREVIOUS LOGIC
    // We need to ensure we are actually using the rate from the database
    const actualRate = (selectedCountry.currencyCode === 'USD') ? 1 : rate;
    
    let localAmount = validUsdPrice * actualRate;
    const isZMW = selectedCountry.currencyCode === "ZMW";

    // Zambia Special Rule: No decimals, round to nearest 10
    if (isZMW) {
      localAmount = Math.ceil(localAmount / 10) * 10;
    }

    const formatted = formatLocal(localAmount);
    return { amount: localAmount, formatted, isZambia: isZMW };
  }, [selectedCountry, formatLocal]);

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
