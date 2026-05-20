"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Client = { id: string; name: string; email?: string; address?: string };
export type Product = { id: string; name: string; price: number };
export type LineItem = { name: string; qty: number; price: number };
export type Invoice = { id: string; number: string; clientId?: string; items: LineItem[]; notes?: string; total: number; createdAt: string; dueDate?: string };
export type Estimate = { id: string; number: string; clientId?: string; items: LineItem[]; total: number; createdAt: string; validUntil?: string };
export type Payment = { id: string; reference: string; clientId?: string; amount: number; createdAt: string; method?: string; invoiceNumber?: string };

type StoreState = {
  clients: Client[];
  products: Product[];
  invoices: Invoice[];
  estimates: Estimate[];
  payments: Payment[];
  addClient: (c: Omit<Client, "id">) => Client;
  addProduct: (p: Omit<Product, "id">) => Product;
  addInvoice: (i: Omit<Invoice, "id">) => Invoice;
  addEstimate: (e: Omit<Estimate, "id">) => Estimate;
  addPayment: (p: Omit<Payment, "id">) => Payment;
};

const LS_KEY = "kryros_invoice_store_v1";
const Ctx = createContext<StoreState | null>(null);

function readLS(): Omit<StoreState, "addClient" | "addProduct" | "addInvoice" | "addEstimate" | "addPayment"> {
  if (typeof window === "undefined") return { clients: [], products: [], invoices: [], estimates: [], payments: [] };
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : { clients: [], products: [], invoices: [], estimates: [], payments: [] };
  } catch {
    return { clients: [], products: [], invoices: [], estimates: [], payments: [] };
  }
}

function writeLS(data: Omit<StoreState, "addClient" | "addProduct" | "addInvoice" | "addEstimate" | "addPayment">) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch {}
}

export function InvoiceStoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(() => readLS().clients);
  const [products, setProducts] = useState<Product[]>(() => readLS().products);
  const [invoices, setInvoices] = useState<Invoice[]>(() => readLS().invoices);
  const [estimates, setEstimates] = useState<Estimate[]>(() => readLS().estimates);
  const [payments, setPayments] = useState<Payment[]>(() => readLS().payments);

  useEffect(() => writeLS({ clients, products, invoices, estimates, payments }), [clients, products, invoices, estimates, payments]);

  const addClient = (c: Omit<Client, "id">): Client => {
    const item: Client = { id: crypto.randomUUID(), ...c };
    setClients(prev => [item, ...prev]);
    return item;
  };
  const addProduct = (p: Omit<Product, "id">): Product => {
    const item: Product = { id: crypto.randomUUID(), ...p };
    setProducts(prev => [item, ...prev]);
    return item;
  };
  const addInvoice = (i: Omit<Invoice, "id">): Invoice => {
    const item: Invoice = { id: crypto.randomUUID(), ...i };
    setInvoices(prev => [item, ...prev]);
    return item;
  };
  const addEstimate = (e: Omit<Estimate, "id">): Estimate => {
    const item: Estimate = { id: crypto.randomUUID(), ...e };
    setEstimates(prev => [item, ...prev]);
    return item;
  };
  const addPayment = (p: Omit<Payment, "id">): Payment => {
    const item: Payment = { id: crypto.randomUUID(), ...p };
    setPayments(prev => [item, ...prev]);
    return item;
  };

  const value: StoreState = { clients, products, invoices, estimates, payments, addClient, addProduct, addInvoice, addEstimate, addPayment };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useInvoiceStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useInvoiceStore must be used within InvoiceStoreProvider");
  return ctx;
}
