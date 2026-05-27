"use client";

import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, DollarSign, Clock, CheckCircle, XCircle, Eye,
  Search, Plus, Trash2, Edit, Package, PlusCircle, X, Ban,
  Bell, Sun, Moon, Menu, Calendar, ChevronDown, ChevronRight,
  Download, MoreHorizontal, CreditCard,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

function MiniSparkline({ color = "#6366F1", up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sgcr${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sgcr${color.replace("#","")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function CreditPage() {
  const BG = "#F8F9FA";
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#4B5563";
  const TEXT3 = "#9CA3AF";
  const HOVER = "#F9FAFB";
  const HEADER_BG = "#FFFFFF";
  const ICON_BG = "#F9FAFB";
  const ACCENT = "#6366F1";

  useEffect(() => {}, []);

  const [activeTab, setActiveTab] = useState<"requests" | "plans" | "products">("requests");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [summaryData, setSummaryData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [planForm, setPlanModalForm] = useState({
    name: "", duration: 6, interestRate: 10, minimumAmount: 500,
    maximumAmount: 10000, targetBrandId: "", targetCategoryId: "", isActive: true,
  });
  const [form, setForm] = useState({
    name: "", sku: "", price: "", description: "", categorySlug: "",
    brandId: "" as string | number, allowCredit: true, creditMinimum: "",
    creditMessage: "", isActive: true, hasFiveYearGuarantee: true,
    fiveYearGuaranteeText: "5 Year Guarantee", hasFreeReturns: true,
    freeReturnsText: "Free Returns", hasInstallmentOptions: true,
    installmentOptionsText: "Installment Options",
    images: [] as string[], specifications: [] as { key: string; value: string }[],
  });

  const CATEGORY_ATTRIBUTES: Record<string, string[]> = {
    "mobile-phones": ["RAM", "Storage", "Battery", "Screen Size", "Processor", "Camera", "Color"],
    "laptops": ["RAM", "Storage", "Processor", "Graphics", "Display", "Operating System"],
    "clothing": ["Size", "Material", "Color", "Gender", "Style"],
    "shoes": ["Size", "Color", "Material", "Type"],
    "software": ["License Type", "Platform", "Version", "Validity"],
    "gadgets": ["Battery Life", "Connectivity", "Type", "Color"],
    "default": ["Color", "Material", "Weight", "Dimensions"],
  };
  const currentCategoryAttributes = CATEGORY_ATTRIBUTES[form.categorySlug] || CATEGORY_ATTRIBUTES["default"];

  const [editItem, setEditItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    id: "", name: "", sku: "", price: "", description: "", categorySlug: "",
    brandId: "" as string | number, allowCredit: true, creditMinimum: "",
    creditMessage: "", isActive: true, hasFiveYearGuarantee: true,
    fiveYearGuaranteeText: "", hasFreeReturns: true, freeReturnsText: "",
    hasInstallmentOptions: true, installmentOptionsText: "",
    images: [] as string[], specifications: [] as { key: string; value: string }[],
  });
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const currentEditCategoryAttributes = CATEGORY_ATTRIBUTES[editForm.categorySlug] || CATEGORY_ATTRIBUTES["default"];

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryRes, accountsRes, plansRes, catsRes, brandsRes, productsRes] = await Promise.all([
        fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" }).then(r => r.json()),
        fetch("/internal/admin/credit/accounts", { cache: "no-store" }).then(r => r.json()),
        fetch("/internal/admin/credit/plans", { cache: "no-store" }).then(r => r.json()),
        fetch("/internal/admin/categories", { cache: "no-store" }).then(r => r.json()),
        fetch("/internal/admin/brands", { cache: "no-store" }).then(r => r.json()),
        fetch("/internal/admin/products", { cache: "no-store" }).then(r => r.json()),
      ]);
      setSummaryData(summaryRes);
      setAccounts(accountsRes.data || []);
      setPlans(plansRes || []);
      setCategories(catsRes.data || []);
      setBrands(brandsRes.data || []);
      const allProds = Array.isArray(productsRes?.products) ? productsRes.products : productsRes?.data || [];
      setProducts(allProds.filter((p: any) => !!p.allowCredit));
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  async function compressImage(file: File, maxWidth = 800, quality = 0.85): Promise<string> {
    const blobURL = URL.createObjectURL(file);
    const img = new Image();
    const p = new Promise<HTMLImageElement>((resolve, reject) => { img.onload = () => resolve(img); img.onerror = reject; img.src = blobURL; });
    const i = await p;
    const scale = Math.min(1, maxWidth / i.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(i.width * scale); canvas.height = Math.round(i.height * scale);
    canvas.getContext("2d")!.drawImage(i, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(blobURL);
    return canvas.toDataURL("image/jpeg", quality);
  }

  const handleSavePlan = async () => {
    try {
      const url = editingPlan ? `/internal/admin/credit/plans/${editingPlan.id}` : `/internal/admin/credit/plans`;
      const res = await fetch(url, {
        method: editingPlan ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...planForm, targetBrandId: planForm.targetBrandId ? Number(planForm.targetBrandId) : null, targetCategoryId: planForm.targetCategoryId || null }),
      });
      if (res.ok) { setIsPlanModalOpen(false); setEditingPlan(null); loadData(); }
    } catch { alert("Failed to save plan"); }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/internal/admin/credit/accounts/${id}/status`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }) });
      if (res.ok) setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, status: newStatus } : acc));
    } catch { }
  };

  const getStatusColor = (status: string): [string, string] => {
    const m: Record<string, [string, string]> = {
      ACTIVE: ["#22C55E", "rgba(34,197,94,0.12)"], APPROVED: ["#22C55E", "rgba(34,197,94,0.12)"],
      COMPLETED: ["#3B82F6", "rgba(59,130,246,0.12)"], PENDING: ["#F59E0B", "rgba(245,158,11,0.12)"],
      REVIEWING: ["#3B82F6", "rgba(59,130,246,0.12)"], REJECTED: ["#EF4444", "rgba(239,68,68,0.12)"],
      CANCELLED: ["#EF4444", "rgba(239,68,68,0.12)"], DEFAULTED: ["#EF4444", "rgba(239,68,68,0.12)"],
      BLACKLISTED: ["#DC2626", "rgba(220,38,38,0.12)"],
    };
    return m[status.toUpperCase()] || ["#6B7280", "rgba(107,114,128,0.12)"];
  };

  const inpStyle = (bg = CARD): React.CSSProperties => ({
    width: "100%", background: bg, border: "1px solid #E5E7EB", borderRadius: 10,
    padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none",
  });
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: TEXT2, textTransform: "uppercase",
    letterSpacing: "0.08em", display: "block", marginBottom: 6,
  };
  const card: React.CSSProperties = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };

  const tabs = [
    { id: "requests" as const, label: "Applications", count: accounts.length },
    { id: "plans" as const, label: "Manage Plans", count: plans.length },
    { id: "products" as const, label: "Installment Products", count: products.length },
  ];

  const filteredAccounts = accounts.filter(acc => {
    const q = searchQuery.toLowerCase();
    return !q || (acc.user?.firstName || "").toLowerCase().includes(q) || (acc.user?.lastName || "").toLowerCase().includes(q) || (acc.user?.email || "").toLowerCase().includes(q);
  });

  return (
    <>
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: "24px" }}>

        {/* HEADER */}

        {/* Body */}

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Credit Management</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span><ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: "#6366F1" }}>Credit</span>
              </div>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Manage applications and rules for installments</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} /> Export
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Active Accounts", value: summaryData?.credit?.activeAccounts || 0, change: "+6.2%", up: true, color: "#3B82F6", icon: CreditCard },
              { label: "Total Outstanding", value: formatPrice(summaryData?.credit?.totalOutstanding || 0), change: "+14.5%", up: true, color: "#6366F1", icon: DollarSign },
              { label: "Repayment Rate", value: `${summaryData?.credit?.repaymentRate || 0}%`, change: "+2.1%", up: true, color: "#22C55E", icon: TrendingUp },
              { label: "Default Rate", value: `${summaryData?.credit?.defaultRate || 0}%`, change: "-0.8%", up: false, color: "#EF4444", icon: TrendingUp },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>{s.up ? "▲" : "▼"} {s.change}</span>
                </div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: typeof s.value === "string" && s.value.startsWith("$") ? 18 : 26, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                <div style={{ marginTop: 8 }}><MiniSparkline color={s.color} up={s.up} /></div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div style={{ borderBottom: "1px solid #E5E7EB" }}>
            <nav style={{ display: "flex", gap: 4 }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? `2px solid #6366F1` : "2px solid transparent", color: activeTab === tab.id ? "#6366F1" : TEXT2, whiteSpace: "nowrap", transition: "color 0.15s" }}>
                  {tab.label}
                  <span style={{ fontSize: 10, fontWeight: 700, background: HOVER, color: TEXT2, padding: "1px 7px", borderRadius: 20, marginLeft: 2 }}>{tab.count}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* REQUESTS TAB */}
          {activeTab === "requests" && (
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: TEXT, margin: 0 }}>All Credit Applications</h3>
                <div style={{ position: "relative" }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
                  <input type="text" placeholder="Search user or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ background: HOVER, border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 12px 8px 30px", color: TEXT, fontSize: 12, outline: "none", width: 240 }} />
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #E5E7EB", background: HOVER }}>
                      {["User", "Product", "Plan", "Amount", "Status", "Actions"].map((h, i) => (
                        <th key={h} style={{ padding: "12px 16px", fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i >= 5 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.length === 0 ? (
                      <tr><td colSpan={6} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2, fontStyle: "italic" }}>No credit accounts found</td></tr>
                    ) : filteredAccounts.map(acc => {
                      const [sc, sb] = getStatusColor(acc.status);
                      return (
                        <tr key={acc.id} style={{ borderBottom: "1px solid #E5E7EB" }}
                          onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ fontWeight: 700, color: TEXT, fontSize: 13 }}>{acc.user?.firstName} {acc.user?.lastName}</div>
                            <div style={{ fontSize: 11, color: TEXT2 }}>{acc.user?.email}</div>
                          </td>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ fontWeight: 600, color: TEXT, fontSize: 13 }}>{acc.product?.name}</div>
                            <div style={{ fontSize: 11, color: TEXT2 }}>Price: {formatPrice(acc.product?.price || 0)}</div>
                          </td>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ fontWeight: 600, color: TEXT, fontSize: 13 }}>{acc.creditPlan?.name}</div>
                            <div style={{ fontSize: 11, color: TEXT2 }}>{acc.creditPlan?.duration} months</div>
                          </td>
                          <td style={{ padding: "13px 16px", fontWeight: 800, color: TEXT, fontSize: 14 }}>{formatPrice(acc.amount)}</td>
                          <td style={{ padding: "13px 16px" }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: sc, background: sb, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                              {acc.status}
                            </span>
                          </td>
                          <td style={{ padding: "13px 16px", textAlign: "right" }}>
                            <select value={acc.status} onChange={e => handleStatusUpdate(acc.id, e.target.value)}
                              style={{ fontSize: 11, background: HOVER, border: "1px solid #E5E7EB", borderRadius: 8, padding: "4px 8px", color: TEXT, outline: "none", cursor: "pointer" }}>
                              <option value="ACTIVE">Active</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="DEFAULTED">Defaulted</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === "products" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: TEXT, margin: 0 }}>Installment Product Inventory</h3>
                <button onClick={() => setShowCreate(!showCreate)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  <Plus style={{ width: 15, height: 15 }} /> {showCreate ? "Close Form" : "Add Credit Product"}
                </button>
              </div>

              {showCreate && (
                <div style={{ ...card, padding: "24px", border: `2px solid #6366F130` }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left column */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div><label style={labelStyle}>Product Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inpStyle(HOVER)} placeholder="e.g. iPhone 15 Pro (Credit)" /></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label style={labelStyle}>SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} style={inpStyle(HOVER)} placeholder="CR-IP15" /></div>
                        <div><label style={labelStyle}>Cash Price (USD)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} style={inpStyle(HOVER)} placeholder="0.00" /></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label style={labelStyle}>Min Deposit</label><input type="number" value={form.creditMinimum} onChange={e => setForm({ ...form, creditMinimum: e.target.value })} style={inpStyle(HOVER)} placeholder="e.g. 200" /></div>
                        <div>
                          <label style={labelStyle}>Category</label>
                          <select value={form.categorySlug} onChange={e => setForm({ ...form, categorySlug: e.target.value })} style={{ ...inpStyle(HOVER), appearance: "none" }}>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                          </select>
                        </div>
                      </div>
                      <div><label style={labelStyle}>Credit Policy/Message</label><textarea value={form.creditMessage} onChange={e => setForm({ ...form, creditMessage: e.target.value })} rows={3} style={{ ...inpStyle(HOVER), resize: "none" }} placeholder="e.g. Pay 20% deposit and split the rest over 6 months..." /></div>

                      {/* Dynamic Specs */}
                      <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <label style={labelStyle}>Dynamic Specifications</label>
                          <button onClick={() => setForm({ ...form, specifications: [...form.specifications, { key: "", value: "" }] })}
                            style={{ fontSize: 10, background: TEXT, color: CARD, padding: "3px 8px", borderRadius: 6, border: "none", fontWeight: 700, cursor: "pointer" }}>+ Add Spec</button>
                        </div>
                        <div style={{ background: HOVER, borderRadius: 10, padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
                          {currentCategoryAttributes.length > 0 && (
                            <div style={{ marginBottom: 6 }}>
                              <p style={{ fontSize: 9, fontWeight: 800, color: TEXT2, textTransform: "uppercase", marginBottom: 6 }}>Quick Suggestions:</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {currentCategoryAttributes.map(attr => (
                                  <button key={attr} onClick={() => { if (!form.specifications.find(s => s.key === attr)) setForm({ ...form, specifications: [...form.specifications, { key: attr, value: "" }] }); }}
                                    style={{ fontSize: 9, background: CARD, border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 8px", color: TEXT2, fontWeight: 700, cursor: "pointer" }}>+ {attr}</button>
                                ))}
                              </div>
                            </div>
                          )}
                          {form.specifications.length === 0 ? (
                            <p style={{ fontSize: 10, color: TEXT2, textAlign: "center", fontStyle: "italic" }}>No custom specs added.</p>
                          ) : form.specifications.map((spec, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 6 }}>
                              <input placeholder="Attribute" value={spec.key} onChange={e => { const s = [...form.specifications]; s[idx].key = e.target.value; setForm({ ...form, specifications: s }); }} style={{ ...inpStyle(CARD), fontSize: 11, flex: 1 }} />
                              <input placeholder="Value" value={spec.value} onChange={e => { const s = [...form.specifications]; s[idx].value = e.target.value; setForm({ ...form, specifications: s }); }} style={{ ...inpStyle(CARD), fontSize: 11, flex: 1 }} />
                              <button onClick={() => setForm({ ...form, specifications: form.specifications.filter((_, i) => i !== idx) })} style={{ background: "transparent", border: "none", color: TEXT2, cursor: "pointer" }}><X style={{ width: 12, height: 12 }} /></button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Guarantee section */}
                      <div style={{ background: HOVER, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                        <p style={{ fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", margin: 0 }}>Guarantee & Details</p>
                        {[
                          { label: "Show Guarantee", checked: form.hasFiveYearGuarantee, onChange: (v: boolean) => setForm({ ...form, hasFiveYearGuarantee: v }), textVal: form.fiveYearGuaranteeText, textKey: "fiveYearGuaranteeText", placeholder: "e.g. 5 YEARS GUARANTEE" },
                          { label: "Show Free Returns", checked: form.hasFreeReturns, onChange: (v: boolean) => setForm({ ...form, hasFreeReturns: v }), textVal: form.freeReturnsText, textKey: "freeReturnsText", placeholder: "e.g. FREE RETURNS" },
                          { label: "Show Installment Options", checked: form.hasInstallmentOptions, onChange: (v: boolean) => setForm({ ...form, hasInstallmentOptions: v }), textVal: form.installmentOptionsText, textKey: "installmentOptionsText", placeholder: "e.g. INSTALLMENT OPTIONS" },
                        ].map((g, i) => (
                          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: TEXT, cursor: "pointer" }}>
                              <input type="checkbox" checked={g.checked} onChange={e => g.onChange(e.target.checked)} style={{ width: 14, height: 14 }} /> {g.label}
                            </label>
                            <input placeholder={g.placeholder} value={g.textVal} onChange={e => setForm({ ...form, [g.textKey]: e.target.value })} style={{ ...inpStyle(CARD), fontSize: 11 }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right column   images */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div>
                        <label style={labelStyle}>Product Images</label>
                        <input type="file" multiple accept="image/*" onChange={async e => {
                          const fl = Array.from(e.target.files || []);
                          const pv = await Promise.all(fl.map(f => compressImage(f, 1200, 0.85)));
                          setForm({ ...form, images: [...form.images, ...pv] });
                          setFiles(prev => [...prev, ...fl]);
                        }} style={{ fontSize: 12, color: TEXT2, marginBottom: 10 }} />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {form.images.map((src, i) => (
                            <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid #E5E7EB" }}>
                              <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <button onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                                style={{ position: "absolute", top: 4, right: 4, background: "#EF4444", border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                                <X style={{ width: 10, height: 10 }} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 14, borderTop: "1px solid #E5E7EB" }}>
                        <button onClick={() => setShowCreate(false)} style={{ flex: 1, padding: "10px", background: HOVER, border: "1px solid #E5E7EB", borderRadius: 10, color: TEXT2, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cancel</button>
                        <button disabled={creating} onClick={async () => {
                          setCreating(true);
                          try {
                            const fd = new FormData();
                            fd.append("name", form.name); fd.append("sku", form.sku); fd.append("price", form.price);
                            fd.append("allowCredit", "true"); fd.append("isWholesaleOnly", "false");
                            fd.append("creditMinimum", form.creditMinimum); fd.append("creditMessage", form.creditMessage);
                            fd.append("categorySlug", form.categorySlug); fd.append("description", form.description || form.name);
                            fd.append("hasFiveYearGuarantee", String(form.hasFiveYearGuarantee));
                            if (form.fiveYearGuaranteeText) fd.append("fiveYearGuaranteeText", form.fiveYearGuaranteeText);
                            fd.append("hasFreeReturns", String(form.hasFreeReturns));
                            if (form.freeReturnsText) fd.append("freeReturnsText", form.freeReturnsText);
                            fd.append("hasInstallmentOptions", String(form.hasInstallmentOptions));
                            if (form.installmentOptionsText) fd.append("installmentOptionsText", form.installmentOptionsText);
                            if (form.specifications.length > 0) fd.append("specifications", JSON.stringify(form.specifications));
                            files.forEach(f => fd.append("images", f));
                            const res = await fetch("/api/admin/products", { method: "POST", body: fd });
                            if (!res.ok) throw new Error("Failed to create product");
                            setShowCreate(false); setFiles([]); setForm({ name: "", sku: "", price: "", description: "", categorySlug: "", brandId: "", allowCredit: true, creditMinimum: "", creditMessage: "", isActive: true, hasFiveYearGuarantee: true, fiveYearGuaranteeText: "5 Year Guarantee", hasFreeReturns: true, freeReturnsText: "Free Returns", hasInstallmentOptions: true, installmentOptionsText: "Installment Options", images: [], specifications: [] });
                            loadData();
                          } catch (e: any) { alert(e.message); } finally { setCreating(false); }
                        }} style={{ flex: 2, padding: "10px", background: "#6366F1", border: "none", borderRadius: 10, color: "#0B1320", fontWeight: 800, fontSize: 13, cursor: creating ? "not-allowed" : "pointer", textTransform: "uppercase", letterSpacing: "0.06em", opacity: creating ? 0.7 : 1 }}>
                          {creating ? "Creating..." : "Create Product"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Table */}
              <div style={{ ...card, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #E5E7EB", background: HOVER }}>
                        {["Product", "Cash Price", "Min Deposit", "Status", "Actions"].map((h, i) => (
                          <th key={h} style={{ padding: "12px 16px", fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i >= 4 ? "right" : "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id} style={{ borderBottom: "1px solid #E5E7EB" }}
                          onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 44, height: 44, borderRadius: 10, background: HOVER, border: "1px solid #E5E7EB", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {p.images?.[0] ? <img src={p.images[0].url} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Package style={{ width: 20, height: 20, color: TEXT2 }} />}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: TEXT, fontSize: 13 }}>{p.name}</div>
                                <div style={{ fontSize: 10, fontFamily: "monospace", color: TEXT2, textTransform: "uppercase" }}>{p.sku}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "13px 16px", fontWeight: 800, color: TEXT, fontSize: 14 }}>{formatPrice(p.price)}</td>
                          <td style={{ padding: "13px 16px", fontWeight: 800, color: "#22C55E", fontSize: 14 }}>{p.creditMinimum ? formatPrice(Number(p.creditMinimum)) : " "}</td>
                          <td style={{ padding: "13px 16px" }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: p.isActive ? "#22C55E" : TEXT2, background: p.isActive ? "rgba(34,197,94,0.12)" : HOVER, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>{p.isActive ? "Active" : "Hidden"}</span>
                          </td>
                          <td style={{ padding: "13px 16px", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                              <button onClick={() => {
                                setEditItem(p);
                                setEditForm({ id: p.id, name: p.name, sku: p.sku, price: String(p.price || ""), description: p.description || "", categorySlug: p.category?.slug || "", brandId: p.brand?.id || "", allowCredit: true, creditMinimum: String(p.creditMinimum || ""), creditMessage: p.creditMessage || "", isActive: p.isActive !== false, hasFiveYearGuarantee: !!p.hasFiveYearGuarantee, fiveYearGuaranteeText: p.fiveYearGuaranteeText || "", hasFreeReturns: !!p.hasFreeReturns, freeReturnsText: p.freeReturnsText || "", hasInstallmentOptions: !!p.hasInstallmentOptions, installmentOptionsText: p.installmentOptionsText || "", images: p.images?.map((img: any) => img.url) || [], specifications: typeof (p as any).specifications === "string" ? JSON.parse((p as any).specifications) : (Array.isArray((p as any).specifications) ? (p as any).specifications : []) });
                              }} style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "none", color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                                <Edit style={{ width: 14, height: 14 }} />
                              </button>
                              <button onClick={async () => { if (!confirm("Delete this credit product?")) return; await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" }); loadData(); }}
                                style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "none", color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                                onMouseLeave={e => { e.currentTarget.style.color = TEXT2; e.currentTarget.style.background = "transparent"; }}>
                                <Trash2 style={{ width: 14, height: 14 }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PLANS TAB */}
          {activeTab === "plans" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: TEXT, margin: 0 }}>Available Installment Plans</h3>
                <button onClick={() => { setEditingPlan(null); setPlanModalForm({ name: "", duration: 6, interestRate: 10, minimumAmount: 500, maximumAmount: 10000, targetBrandId: "", targetCategoryId: "", isActive: true }); setIsPlanModalOpen(true); }}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  <Plus style={{ width: 15, height: 15 }} /> Create New Plan
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                {plans.map(plan => (
                  <div key={plan.id} style={{ ...card, padding: "20px", borderTop: `4px solid #6366F1` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div>
                        <h4 style={{ fontSize: 15, fontWeight: 800, color: TEXT, margin: "0 0 2px" }}>{plan.name}</h4>
                        <p style={{ fontSize: 10, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{plan.duration} Months</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 800, color: plan.isActive ? "#22C55E" : TEXT2, background: plan.isActive ? "rgba(34,197,94,0.12)" : HOVER, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                        {plan.isActive ? "ACTIVE" : "DISABLED"}
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {[
                        { label: "Interest Rate", val: `${plan.interestRate}%`, color: "#22C55E" },
                        { label: "Price Range", val: `${formatPrice(plan.minimumAmount)} – ${formatPrice(plan.maximumAmount)}`, color: TEXT },
                      ].map((r, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                          <span style={{ color: TEXT2 }}>{r.label}</span>
                          <span style={{ fontWeight: 700, color: r.color }}>{r.val}</span>
                        </div>
                      ))}
                      <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 10 }}>
                        <p style={{ fontSize: 9, fontWeight: 800, color: TEXT2, textTransform: "uppercase", marginBottom: 6 }}>Applicable To</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                          {!plan.targetBrandId && !plan.targetCategoryId && <span style={{ fontSize: 9, fontWeight: 800, color: "#3B82F6", background: "rgba(59,130,246,0.1)", padding: "2px 8px", borderRadius: 20 }}>ALL PRODUCTS</span>}
                          {plan.brand && <span style={{ fontSize: 9, fontWeight: 800, color: "#F97316", background: "rgba(249,115,22,0.1)", padding: "2px 8px", borderRadius: 20 }}>BRAND: {plan.brand.name}</span>}
                          {plan.category && <span style={{ fontSize: 9, fontWeight: 800, color: "#8B5CF6", background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: 20 }}>CAT: {plan.category.name}</span>}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { setEditingPlan(plan); setPlanModalForm({ name: plan.name, duration: plan.duration, interestRate: Number(plan.interestRate), minimumAmount: Number(plan.minimumAmount), maximumAmount: Number(plan.maximumAmount), targetBrandId: plan.targetBrandId || "", targetCategoryId: plan.targetCategoryId || "", isActive: plan.isActive }); setIsPlanModalOpen(true); }}
                      style={{ width: "100%", padding: "8px", background: HOVER, border: "1px solid #E5E7EB", borderRadius: 10, color: TEXT2, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      Edit Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PLAN MODAL */}
        {isPlanModalOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
            <div className="max-w-lg w-full mx-auto" style={{ background: CARD, borderRadius: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.25)", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", background: HOVER }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: TEXT, margin: 0 }}>{editingPlan ? "Edit Credit Plan" : "Create New Credit Plan"}</h3>
                <button onClick={() => setIsPlanModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2 }}><X style={{ width: 20, height: 20 }} /></button>
              </div>
              <div style={{ padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label style={labelStyle}>Plan Name</label><input placeholder="e.g. Standard 6-Month Plan" style={inpStyle(HOVER)} value={planForm.name} onChange={e => setPlanModalForm({ ...planForm, name: e.target.value })} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label style={labelStyle}>Duration (Months)</label><input type="number" style={inpStyle(HOVER)} value={planForm.duration} onChange={e => setPlanModalForm({ ...planForm, duration: Number(e.target.value) })} /></div>
                  <div><label style={labelStyle}>Interest Rate (%)</label><input type="number" style={inpStyle(HOVER)} value={planForm.interestRate} onChange={e => setPlanModalForm({ ...planForm, interestRate: Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><label style={labelStyle}>Min Price (USD)</label><input type="number" style={inpStyle(HOVER)} value={planForm.minimumAmount} onChange={e => setPlanModalForm({ ...planForm, minimumAmount: Number(e.target.value) })} /></div>
                  <div><label style={labelStyle}>Max Price (USD)</label><input type="number" style={inpStyle(HOVER)} value={planForm.maximumAmount} onChange={e => setPlanModalForm({ ...planForm, maximumAmount: Number(e.target.value) })} /></div>
                </div>
                <div style={{ background: "rgba(59,130,246,0.06)", borderRadius: 12, padding: 16, border: "1px solid rgba(59,130,246,0.15)", display: "flex", flexDirection: "column", gap: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#3B82F6", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Eligibility Rules</p>
                  <div>
                    <label style={labelStyle}>Limit to Brand</label>
                    <select style={{ ...inpStyle(CARD), appearance: "none" }} value={planForm.targetBrandId} onChange={e => setPlanModalForm({ ...planForm, targetBrandId: e.target.value })}>
                      <option value="">Apply to All Brands</option>
                      {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Limit to Category</label>
                    <select style={{ ...inpStyle(CARD), appearance: "none" }} value={planForm.targetCategoryId} onChange={e => setPlanModalForm({ ...planForm, targetCategoryId: e.target.value })}>
                      <option value="">Apply to All Categories</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, color: TEXT }}>
                  <input type="checkbox" checked={planForm.isActive} onChange={e => setPlanModalForm({ ...planForm, isActive: e.target.checked })} style={{ width: 15, height: 15 }} />
                  Plan is Active and Visible to Users
                </label>
              </div>
              <div style={{ padding: "16px 24px", borderTop: "1px solid #E5E7EB", background: HOVER, display: "flex", gap: 10 }}>
                <button onClick={() => setIsPlanModalOpen(false)} style={{ flex: 1, padding: "11px", background: "transparent", border: "none", color: TEXT2, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleSavePlan} style={{ flex: 2, padding: "11px", background: "#6366F1", border: "none", borderRadius: 12, color: "#0B1320", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                  {editingPlan ? "Update Plan Settings" : "Create Credit Plan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT PRODUCT MODAL */}
        {editItem && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
            <div className="w-full md:max-w-4xl" style={{ background: CARD, borderRadius: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.25)", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #E5E7EB", display: "flex", justifyContent: "space-between", alignItems: "center", background: HOVER }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: TEXT, margin: 0 }}>Edit Installment Product</h3>
                <button onClick={() => setEditItem(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2 }}><X style={{ width: 20, height: 20 }} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{padding: 24, overflowY: "auto"}}>
                {/* Left */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div><label style={labelStyle}>Product Name</label><input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={inpStyle(HOVER)} /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div><label style={labelStyle}>SKU</label><input value={editForm.sku} onChange={e => setEditForm({ ...editForm, sku: e.target.value })} style={inpStyle(HOVER)} /></div>
                    <div><label style={labelStyle}>Price (USD)</label><input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} style={inpStyle(HOVER)} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div><label style={labelStyle}>Min Deposit</label><input type="number" value={editForm.creditMinimum} onChange={e => setEditForm({ ...editForm, creditMinimum: e.target.value })} style={inpStyle(HOVER)} /></div>
                    <div><label style={labelStyle}>Category</label><select value={editForm.categorySlug} onChange={e => setEditForm({ ...editForm, categorySlug: e.target.value })} style={{ ...inpStyle(HOVER), appearance: "none" }}>{categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}</select></div>
                  </div>
                  <div><label style={labelStyle}>Policy Message</label><textarea value={editForm.creditMessage} onChange={e => setEditForm({ ...editForm, creditMessage: e.target.value })} rows={3} style={{ ...inpStyle(HOVER), resize: "none" }} /></div>
                  {/* Specs */}
                  <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <label style={labelStyle}>Dynamic Specifications</label>
                      <button onClick={() => setEditForm({ ...editForm, specifications: [...editForm.specifications, { key: "", value: "" }] })} style={{ fontSize: 10, background: TEXT, color: CARD, padding: "3px 8px", borderRadius: 6, border: "none", fontWeight: 700, cursor: "pointer" }}>+ Add Spec</button>
                    </div>
                    <div style={{ background: HOVER, borderRadius: 10, padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      {currentEditCategoryAttributes.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                            {currentEditCategoryAttributes.map(attr => (
                              <button key={attr} onClick={() => { if (!editForm.specifications.find(s => s.key === attr)) setEditForm({ ...editForm, specifications: [...editForm.specifications, { key: attr, value: "" }] }); }}
                                style={{ fontSize: 9, background: CARD, border: "1px solid #E5E7EB", borderRadius: 6, padding: "2px 7px", color: TEXT2, fontWeight: 700, cursor: "pointer" }}>+ {attr}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {editForm.specifications.map((spec, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 6 }}>
                          <input placeholder="Attribute" value={spec.key} onChange={e => { const s = [...editForm.specifications]; s[idx].key = e.target.value; setEditForm({ ...editForm, specifications: s }); }} style={{ ...inpStyle(CARD), fontSize: 11, flex: 1 }} />
                          <input placeholder="Value" value={spec.value} onChange={e => { const s = [...editForm.specifications]; s[idx].value = e.target.value; setEditForm({ ...editForm, specifications: s }); }} style={{ ...inpStyle(CARD), fontSize: 11, flex: 1 }} />
                          <button onClick={() => setEditForm({ ...editForm, specifications: editForm.specifications.filter((_, i) => i !== idx) })} style={{ background: "transparent", border: "none", color: TEXT2, cursor: "pointer" }}><X style={{ width: 12, height: 12 }} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Guarantee */}
                  <div style={{ background: HOVER, borderRadius: 12, padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    <p style={{ fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", margin: 0 }}>Guarantee & Details</p>
                    {[
                      { label: "Show Guarantee", checked: editForm.hasFiveYearGuarantee, onChange: (v: boolean) => setEditForm({ ...editForm, hasFiveYearGuarantee: v }), textVal: editForm.fiveYearGuaranteeText, textKey: "fiveYearGuaranteeText", placeholder: "e.g. 5 YEARS GUARANTEE" },
                      { label: "Show Free Returns", checked: editForm.hasFreeReturns, onChange: (v: boolean) => setEditForm({ ...editForm, hasFreeReturns: v }), textVal: editForm.freeReturnsText, textKey: "freeReturnsText", placeholder: "e.g. FREE RETURNS" },
                      { label: "Show Installment Options", checked: editForm.hasInstallmentOptions, onChange: (v: boolean) => setEditForm({ ...editForm, hasInstallmentOptions: v }), textVal: editForm.installmentOptionsText, textKey: "installmentOptionsText", placeholder: "e.g. INSTALLMENT OPTIONS" },
                    ].map((g, i) => (
                      <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: TEXT, cursor: "pointer" }}>
                          <input type="checkbox" checked={g.checked} onChange={e => g.onChange(e.target.checked)} style={{ width: 14, height: 14 }} /> {g.label}
                        </label>
                        <input placeholder={g.placeholder} value={g.textVal} onChange={e => setEditForm({ ...editForm, [g.textKey]: e.target.value })} style={{ ...inpStyle(CARD), fontSize: 11 }} />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Right   images */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Product Images</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3" style={{ gap: 8, marginBottom: 10 }}>
                      {editForm.images.map((src, i) => (
                        <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid #E5E7EB" }}>
                          <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <button onClick={() => setEditForm({ ...editForm, images: editForm.images.filter((_, idx) => idx !== i) })} style={{ position: "absolute", top: 4, right: 4, background: "#EF4444", border: "none", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}><X style={{ width: 10, height: 10 }} /></button>
                        </div>
                      ))}
                      <label style={{ aspectRatio: "1", border: `2px dashed #E5E7EB`, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <PlusCircle style={{ width: 20, height: 20, color: TEXT2 }} />
                        <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={async e => { const fl = Array.from(e.target.files || []); const pv = await Promise.all(fl.map(f => compressImage(f, 1200, 0.85))); setEditForm({ ...editForm, images: [...editForm.images, ...pv] }); setEditFiles(prev => [...prev, ...fl]); }} />
                      </label>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: "auto", paddingTop: 14, borderTop: "1px solid #E5E7EB" }}>
                    <button onClick={() => setEditItem(null)} style={{ flex: 1, padding: "11px", background: HOVER, border: "1px solid #E5E7EB", borderRadius: 10, color: TEXT2, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cancel</button>
                    <button disabled={creating} onClick={async () => {
                      setCreating(true);
                      try {
                        const fd = new FormData();
                        fd.append("name", editForm.name); fd.append("sku", editForm.sku); fd.append("price", editForm.price);
                        fd.append("allowCredit", "true"); fd.append("isWholesaleOnly", "false");
                        fd.append("creditMinimum", editForm.creditMinimum); fd.append("creditMessage", editForm.creditMessage);
                        fd.append("categorySlug", editForm.categorySlug); fd.append("description", editForm.description || editForm.name);
                        fd.append("hasFiveYearGuarantee", String(editForm.hasFiveYearGuarantee));
                        if (editForm.fiveYearGuaranteeText) fd.append("fiveYearGuaranteeText", editForm.fiveYearGuaranteeText);
                        fd.append("hasFreeReturns", String(editForm.hasFreeReturns));
                        if (editForm.freeReturnsText) fd.append("freeReturnsText", editForm.freeReturnsText);
                        fd.append("hasInstallmentOptions", String(editForm.hasInstallmentOptions));
                        if (editForm.installmentOptionsText) fd.append("installmentOptionsText", editForm.installmentOptionsText);
                        if (editForm.specifications.length > 0) fd.append("specifications", JSON.stringify(editForm.specifications));
                        editFiles.forEach(f => fd.append("images", f));
                        const res = await fetch(`/api/admin/products/${editItem.id}`, { method: "PUT", body: fd });
                        if (!res.ok) throw new Error("Update failed");
                        setEditItem(null); loadData();
                      } catch (e: any) { alert(e.message); } finally { setCreating(false); }
                    }} style={{ flex: 2, padding: "11px", background: "#6366F1", border: "none", borderRadius: 10, color: "#0B1320", fontWeight: 800, fontSize: 13, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.7 : 1 }}>
                      {creating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}