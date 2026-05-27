"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Calendar, Sun, Moon, Menu, ChevronDown, ChevronRight,
  Save, X, Plus, Trash2, Package, ImagePlus, Tag, DollarSign,
  BarChart3, Star, CreditCard, ShieldCheck, RotateCcw, Layers,
  ArrowLeft, AlertCircle, CheckCircle, Loader2,
} from "lucide-react";

const CATEGORY_ATTRIBUTES: Record<string, string[]> = {
  "mobile-phones": ["RAM", "Storage", "Battery", "Screen Size", "Processor", "Camera", "Color"],
  "laptops": ["RAM", "Storage", "Processor", "Graphics", "Display", "Operating System"],
  "clothing": ["Size", "Material", "Color", "Gender", "Style"],
  "shoes": ["Size", "Color", "Material", "Type"],
  "software": ["License Type", "Platform", "Version", "Validity"],
  "gadgets": ["Battery Life", "Connectivity", "Type", "Color"],
  "default": ["Color", "Material", "Weight", "Dimensions"],
};

type Category = { id: string; name: string; slug: string };
type Brand = { id: number; name: string; slug: string };

async function compressImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
  const blobURL = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = blobURL; });
  const scale = Math.min(1, maxWidth / img.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(blobURL);
  return canvas.toDataURL("image/jpeg", quality);
}

export default function AddProductPage() {
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

  const router = useRouter();

  useEffect(() => {}, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "", slug: "", sku: "", description: "",
    price: "", salePrice: "", stock: "0", weight: "",
    categorySlug: "", brandId: "",
    isActive: true, isFeatured: false,
    allowCredit: false, creditMinimum: "", creditMessage: "",
    isWholesaleOnly: false, wholesalePrice: "", wholesaleMinQty: "",
    hasFiveYearGuarantee: false, fiveYearGuaranteeText: "5 Year Guarantee",
    hasFreeReturns: false, freeReturnsText: "Free Returns",
    hasInstallmentOptions: false, installmentOptionsText: "Installment Options",
    metaTitle: "", metaDescription: "",
    specifications: [] as { key: string; value: string }[],
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  const currentCategoryAttributes = CATEGORY_ATTRIBUTES[form.categorySlug] || CATEGORY_ATTRIBUTES["default"];

  useEffect(() => {
    Promise.all([
      fetch("/internal/admin/categories", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
      fetch("/internal/admin/brands", { cache: "no-store" }).then(r => r.json()).catch(() => ({})),
    ]).then(([catsBody, brandsBody]) => {
      setCategories(catsBody.data || catsBody || []);
      setBrands(brandsBody.data || brandsBody || []);
    });
  }, []);

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));

  const handleImages = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const previews = await Promise.all(arr.map(f => compressImage(f)));
    setImagePreviews(p => [...p, ...previews]);
    setImageFiles(p => [...p, ...arr]);
  };

  const removeImage = (i: number) => {
    setImagePreviews(p => p.filter((_, idx) => idx !== i));
    setImageFiles(p => p.filter((_, idx) => idx !== i));
  };

  const addSpec = () => set("specifications", [...form.specifications, { key: "", value: "" }]);
  const updateSpec = (i: number, field: "key" | "value", val: string) => {
    const specs = [...form.specifications];
    specs[i][field] = val;
    set("specifications", specs);
  };
  const removeSpec = (i: number) => set("specifications", form.specifications.filter((_, idx) => idx !== i));
  const addSuggestedSpec = (attr: string) => {
    if (!form.specifications.find(s => s.key === attr)) addSpec();
    set("specifications", [...form.specifications, { key: attr, value: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setToast({ type: "error", text: "Product name is required" }); return; }
    if (!form.price || isNaN(Number(form.price))) { setToast({ type: "error", text: "Valid price is required" }); return; }
    setSaving(true); setToast(null);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("slug", form.slug || autoSlug(form.name));
      if (form.sku) fd.append("sku", form.sku);
      fd.append("price", form.price);
      if (form.salePrice) fd.append("salePrice", form.salePrice);
      fd.append("stock", form.stock || "0");
      if (form.weight) fd.append("weight", form.weight);
      if (form.description) fd.append("description", form.description);
      if (form.categorySlug) fd.append("categorySlug", form.categorySlug);
      if (form.brandId) fd.append("brandId", form.brandId);
      fd.append("isActive", String(form.isActive));
      fd.append("isFeatured", String(form.isFeatured));
      fd.append("allowCredit", String(form.allowCredit));
      if (form.allowCredit && form.creditMinimum) fd.append("creditMinimum", form.creditMinimum);
      if (form.allowCredit && form.creditMessage) fd.append("creditMessage", form.creditMessage);
      fd.append("isWholesaleOnly", String(form.isWholesaleOnly));
      if (form.isWholesaleOnly && form.wholesalePrice) fd.append("wholesalePrice", form.wholesalePrice);
      if (form.isWholesaleOnly && form.wholesaleMinQty) fd.append("wholesaleMinQty", form.wholesaleMinQty);
      fd.append("hasFiveYearGuarantee", String(form.hasFiveYearGuarantee));
      if (form.hasFiveYearGuarantee && form.fiveYearGuaranteeText) fd.append("fiveYearGuaranteeText", form.fiveYearGuaranteeText);
      fd.append("hasFreeReturns", String(form.hasFreeReturns));
      if (form.hasFreeReturns && form.freeReturnsText) fd.append("freeReturnsText", form.freeReturnsText);
      fd.append("hasInstallmentOptions", String(form.hasInstallmentOptions));
      if (form.hasInstallmentOptions && form.installmentOptionsText) fd.append("installmentOptionsText", form.installmentOptionsText);
      if (form.metaTitle) fd.append("metaTitle", form.metaTitle);
      if (form.metaDescription) fd.append("metaDescription", form.metaDescription);
      if (form.specifications.filter(s => s.key).length > 0) fd.append("specifications", JSON.stringify(form.specifications.filter(s => s.key)));
      if (form.tags.length > 0) fd.append("tags", JSON.stringify(form.tags));
      imageFiles.forEach(f => fd.append("images", f));

      const res = await fetch("/internal/admin/products/upload", { method: "POST", body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Error ${res.status}`);
      setToast({ type: "success", text: "Product created successfully!" });
      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err: any) {
      setToast({ type: "error", text: err.message || "Failed to create product" });
    } finally { setSaving(false); }
  };

  const inp: React.CSSProperties = { width: "100%", background: HOVER, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none" };
  const lbl: React.CSSProperties = { fontSize: 10, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 };
  const card: React.CSSProperties = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };
  const sectionHead = (title: string, icon: React.ReactNode) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, paddingBottom: 12, borderBottom: "1px solid #E5E7EB" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `#6366F115`, display: "flex", alignItems: "center", justifyContent: "center", color: "#6366F1" }}>{icon}</div>
      <span style={{ fontSize: 13, fontWeight: 800, color: TEXT, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
    </div>
  );

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) => (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div onClick={onChange} style={{ width: 42, height: 23, borderRadius: 12, background: checked ? "#6366F1" : HOVER, border: "1px solid #E5E7EB", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: checked ? 20 : 3, width: 17, height: 17, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
      {label && <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{label}</span>}
    </label>
  );

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: "24px" }}>

        {/* HEADER */}

        {/* BODY */}
        <form onSubmit={handleSubmit} style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Add New Product</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span style={{ cursor: "pointer", color: TEXT2 }} onClick={() => router.push("/admin")}>Home</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span style={{ cursor: "pointer", color: TEXT2 }} onClick={() => router.push("/admin/products")}>Products</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span style={{ color: "#6366F1" }}>New</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" onClick={() => router.push("/admin/products")}
                style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                <ArrowLeft style={{ width: 15, height: 15 }} /> Back
              </button>
              <button type="submit" disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", borderRadius: 10, padding: "9px 22px", color: "#0B1320", fontWeight: 800, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 style={{ width: 16, height: 16 }} /> : <Save style={{ width: 15, height: 15 }} />}
                {saving ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>

          {/* Toast */}
          {toast && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, background: toast.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, fontSize: 13, fontWeight: 700, color: toast.type === "success" ? "#22C55E" : "#EF4444" }}>
              {toast.type === "success" ? <CheckCircle style={{ width: 18, height: 18 }} /> : <AlertCircle style={{ width: 18, height: 18 }} />}
              {toast.text}
              <button type="button" onClick={() => setToast(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}><X style={{ width: 16, height: 16 }} /></button>
            </div>
          )}

          {/* Main 2-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-4" style={{alignItems: "start"}}>

            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Basic Info */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("Basic Information", <Package style={{ width: 16, height: 16 }} />)}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={lbl}>Product Name *</label>
                    <input required value={form.name} onChange={e => { set("name", e.target.value); if (!form.slug) set("slug", autoSlug(e.target.value)); }} style={inp} placeholder="e.g. Samsung Galaxy S24 Ultra" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label style={lbl}>URL Slug</label>
                      <input value={form.slug} onChange={e => set("slug", e.target.value)} style={inp} placeholder="auto-generated from name" />
                      <p style={{ fontSize: 10, color: TEXT2, marginTop: 4 }}>Leave blank to auto-generate</p>
                    </div>
                    <div>
                      <label style={lbl}>SKU / Product Code</label>
                      <input value={form.sku} onChange={e => set("sku", e.target.value)} style={inp} placeholder="e.g. SAM-S24U-BLK" />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Description</label>
                    <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} style={{ ...inp, resize: "none" }} placeholder="Describe this product in detail   features, what's in the box, warranty info..." />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("Pricing & Inventory", <DollarSign style={{ width: 16, height: 16 }} />)}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label style={lbl}>Price (USD) *</label>
                    <input required type="number" min="0" step="0.01" value={form.price} onChange={e => set("price", e.target.value)} style={inp} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={lbl}>Sale Price</label>
                    <input type="number" min="0" step="0.01" value={form.salePrice} onChange={e => set("salePrice", e.target.value)} style={inp} placeholder="Optional" />
                  </div>
                  <div>
                    <label style={lbl}>Stock Qty</label>
                    <input type="number" min="0" value={form.stock} onChange={e => set("stock", e.target.value)} style={inp} placeholder="0" />
                  </div>
                  <div>
                    <label style={lbl}>Weight (kg)</label>
                    <input type="number" min="0" step="0.01" value={form.weight} onChange={e => set("weight", e.target.value)} style={inp} placeholder="e.g. 0.5" />
                  </div>
                </div>
                {/* Wholesale */}
                <div style={{ marginTop: 16, background: HOVER, borderRadius: 12, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: form.isWholesaleOnly ? 14 : 0 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Wholesale Only</span>
                    <Toggle checked={form.isWholesaleOnly} onChange={() => set("isWholesaleOnly", !form.isWholesaleOnly)} />
                  </div>
                  {form.isWholesaleOnly && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label style={lbl}>Wholesale Price</label><input type="number" min="0" step="0.01" value={form.wholesalePrice} onChange={e => set("wholesalePrice", e.target.value)} style={inp} placeholder="0.00" /></div>
                      <div><label style={lbl}>Min Quantity</label><input type="number" min="1" value={form.wholesaleMinQty} onChange={e => set("wholesaleMinQty", e.target.value)} style={inp} placeholder="e.g. 10" /></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Specifications */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("Specifications", <Layers style={{ width: 16, height: 16 }} />)}
                <div style={{ background: HOVER, borderRadius: 12, padding: 16 }}>
                  {currentCategoryAttributes.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 9, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Quick add for {form.categorySlug || "selected category"}:</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {currentCategoryAttributes.map(attr => (
                          <button key={attr} type="button" onClick={() => { if (!form.specifications.find(s => s.key === attr)) set("specifications", [...form.specifications, { key: attr, value: "" }]); }}
                            style={{ fontSize: 10, background: CARD, border: "1px solid #E5E7EB", borderRadius: 6, padding: "3px 10px", color: TEXT2, fontWeight: 700, cursor: "pointer" }}>+ {attr}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {form.specifications.length === 0 ? (
                    <p style={{ fontSize: 12, color: TEXT2, textAlign: "center", fontStyle: "italic", padding: "10px 0" }}>No specifications added yet</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {form.specifications.map((spec, i) => (
                        <div key={i} style={{ display: "flex", gap: 8 }}>
                          <input placeholder="Attribute (e.g. RAM)" value={spec.key} onChange={e => updateSpec(i, "key", e.target.value)}
                            style={{ ...inp, flex: 1, padding: "8px 12px" }} />
                          <input placeholder="Value (e.g. 12GB)" value={spec.value} onChange={e => updateSpec(i, "value", e.target.value)}
                            style={{ ...inp, flex: 1.5, padding: "8px 12px" }} />
                          <button type="button" onClick={() => removeSpec(i)}
                            style={{ width: 36, borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <X style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={addSpec}
                    style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#6366F1", background: "transparent", border: `1px dashed #6366F160`, borderRadius: 8, padding: "7px 14px", cursor: "pointer", width: "100%", justifyContent: "center" }}>
                    <Plus style={{ width: 13, height: 13 }} /> Add Specification Row
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("Tags", <Tag style={{ width: 16, height: 16 }} />)}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {form.tags.map((tag, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#6366F1", background: `#6366F115`, padding: "4px 10px", borderRadius: 20 }}>
                      {tag}
                      <button type="button" onClick={() => set("tags", form.tags.filter((_, idx) => idx !== i))} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6366F1", display: "flex", padding: 0 }}><X style={{ width: 10, height: 10 }} /></button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder="Add a tag and press Enter..." value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const t = tagInput.trim(); if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]); setTagInput(""); } }}
                    style={{ ...inp, flex: 1 }} />
                  <button type="button" onClick={() => { const t = tagInput.trim(); if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]); setTagInput(""); }}
                    style={{ padding: "10px 14px", background: HOVER, border: "1px solid #E5E7EB", borderRadius: 10, color: TEXT2, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Add</button>
                </div>
              </div>

              {/* SEO */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("SEO Meta", <BarChart3 style={{ width: 16, height: 16 }} />)}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div><label style={lbl}>Meta Title</label><input value={form.metaTitle} onChange={e => set("metaTitle", e.target.value)} style={inp} placeholder="Leave blank to use product name" /></div>
                  <div><label style={lbl}>Meta Description</label><textarea value={form.metaDescription} onChange={e => set("metaDescription", e.target.value)} rows={3} style={{ ...inp, resize: "none" }} placeholder="Short description for search engines (max 160 chars)" /></div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Images */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("Product Images", <ImagePlus style={{ width: 16, height: 16 }} />)}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ gap: 8, marginBottom: 12 }}>
                  {imagePreviews.map((src, i) => (
                    <div key={i} style={{ position: "relative", aspectRatio: "1", borderRadius: 10, overflow: "hidden", border: "1px solid #E5E7EB" }}>
                      <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button type="button" onClick={() => removeImage(i)}
                        style={{ position: "absolute", top: 4, right: 4, background: "#EF4444", border: "none", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                        <X style={{ width: 11, height: 11 }} />
                      </button>
                      {i === 0 && <span style={{ position: "absolute", bottom: 4, left: 4, fontSize: 9, fontWeight: 800, color: "#fff", background: "#6366F1", padding: "2px 6px", borderRadius: 4 }}>MAIN</span>}
                    </div>
                  ))}
                  <label style={{ aspectRatio: "1", border: `2px dashed #E5E7EB`, borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 6, transition: "border-color 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as any).style.borderColor = "#6366F1"; }}
                    onMouseLeave={e => { (e.currentTarget as any).style.borderColor = BORDER; }}>
                    <ImagePlus style={{ width: 22, height: 22, color: TEXT2 }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: TEXT2 }}>Upload</span>
                    <input type="file" multiple accept="image/*" style={{ display: "none" }} onChange={e => handleImages(e.target.files)} />
                  </label>
                </div>
                <p style={{ fontSize: 10, color: TEXT2, textAlign: "center" }}>First image is the main product image. JPG, PNG, WebP supported.</p>
              </div>

              {/* Categorization */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("Categorization", <Tag style={{ width: 16, height: 16 }} />)}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <label style={lbl}>Category</label>
                    <select value={form.categorySlug} onChange={e => set("categorySlug", e.target.value)} style={{ ...inp, appearance: "none" }}>
                      <option value="">  Select Category  </option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Brand</label>
                    <select value={form.brandId} onChange={e => set("brandId", e.target.value)} style={{ ...inp, appearance: "none" }}>
                      <option value="">  Select Brand  </option>
                      {brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("Visibility & Status", <Star style={{ width: 16, height: 16 }} />)}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { key: "isActive", label: "Active (visible in store)", checked: form.isActive },
                    { key: "isFeatured", label: "Featured on homepage", checked: form.isFeatured },
                  ].map(f => (
                    <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: HOVER, borderRadius: 10 }}>
                      <span style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>{f.label}</span>
                      <Toggle checked={f.checked} onChange={() => set(f.key, !f.checked)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Credit Options */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("Installment / Credit", <CreditCard style={{ width: 16, height: 16 }} />)}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: HOVER, borderRadius: 10, marginBottom: form.allowCredit ? 12 : 0 }}>
                  <span style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>Allow Installments</span>
                  <Toggle checked={form.allowCredit} onChange={() => set("allowCredit", !form.allowCredit)} />
                </div>
                {form.allowCredit && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div><label style={lbl}>Minimum Deposit (USD)</label><input type="number" min="0" step="0.01" value={form.creditMinimum} onChange={e => set("creditMinimum", e.target.value)} style={inp} placeholder="e.g. 200" /></div>
                    <div><label style={lbl}>Credit Policy Message</label><textarea value={form.creditMessage} onChange={e => set("creditMessage", e.target.value)} rows={3} style={{ ...inp, resize: "none" }} placeholder="e.g. Pay 20% deposit and split the rest over 6 months..." /></div>
                  </div>
                )}
              </div>

              {/* Guarantee Badges */}
              <div style={{ ...card, padding: "22px 24px" }}>
                {sectionHead("Trust & Guarantee Badges", <ShieldCheck style={{ width: 16, height: 16 }} />)}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { key: "hasFiveYearGuarantee", textKey: "fiveYearGuaranteeText", label: "Show Guarantee Badge", placeholder: "e.g. 5 YEAR GUARANTEE", checked: form.hasFiveYearGuarantee, textVal: form.fiveYearGuaranteeText },
                    { key: "hasFreeReturns", textKey: "freeReturnsText", label: "Show Free Returns Badge", placeholder: "e.g. FREE RETURNS", checked: form.hasFreeReturns, textVal: form.freeReturnsText },
                    { key: "hasInstallmentOptions", textKey: "installmentOptionsText", label: "Show Installment Badge", placeholder: "e.g. INSTALLMENT OPTIONS", checked: form.hasInstallmentOptions, textVal: form.installmentOptionsText },
                  ].map(f => (
                    <div key={f.key}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: f.checked ? 8 : 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{f.label}</span>
                        <Toggle checked={f.checked} onChange={() => set(f.key, !f.checked)} />
                      </div>
                      {f.checked && <input value={f.textVal} onChange={e => set(f.textKey, e.target.value)} style={{ ...inp, fontSize: 12 }} placeholder={f.placeholder} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save button (repeated at bottom for convenience) */}
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => router.push("/admin/products")}
                  style={{ flex: 1, height: 48, background: CARD, border: "1px solid #E5E7EB", borderRadius: 12, color: TEXT2, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex: 2, height: 48, background: "#6366F1", border: "none", borderRadius: 12, color: "#0B1320", fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: saving ? 0.7 : 1 }}>
                  {saving ? <Loader2 style={{ width: 18, height: 18 }} /> : <Save style={{ width: 16, height: 16 }} />}
                  {saving ? "Creating Product..." : "Create Product"}
                </button>
              </div>

            </div>
          </div>
        </form>
      </div>
  );
}