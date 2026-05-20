const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, "")
  : "";

export interface Product {
  id: string;
  name: string;
  brand: string;
  brandId?: number;
  category: string;
  categoryId?: string;
  price: number;
  oldPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  specs: string;
  image: string;
  images: string[];
  badge?: string;
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
}

export interface ApiBrand {
  id: number;
  name: string;
  slug?: string;
  logo?: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug?: string;
  image?: string;
  icon?: string;
  _count?: { products: number };
}

export interface ApiBanner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
  linkText?: string;
  badge?: string;
  tag?: string;
  isActive: boolean;
  position?: number;
}

function normalizeProduct(p: any): Product {
  const basePrice = Number(p.price || 0);
  const salePrice = p.salePrice ? Number(p.salePrice) : 0;
  const flashPrice = p.flashSalePrice ? Number(p.flashSalePrice) : 0;
  const effectivePrice = flashPrice > 0 ? flashPrice : salePrice > 0 ? salePrice : basePrice;
  const originalPrice = basePrice > effectivePrice ? basePrice : effectivePrice;
  const discount =
    originalPrice > effectivePrice
      ? Math.round((1 - effectivePrice / originalPrice) * 100)
      : Number(p.discount || 0);

  const imageList: string[] = (p.images || [])
    .map((img: any) => (typeof img === "string" ? img : img?.url || ""))
    .filter(Boolean);

  const mainImage = imageList[0] || p.imageUrl || p.image || "";

  return {
    id: p.id || "",
    name: p.name || "",
    brand: p.brand?.name || p.brandName || "",
    brandId: p.brand?.id,
    category: p.category?.name || p.categoryName || "",
    categoryId: p.category?.id || p.categoryId || "",
    price: effectivePrice,
    oldPrice: originalPrice,
    discount,
    rating: Number(p.rating || 0),
    reviewCount: Number(p.reviewCount || p._count?.reviews || 0),
    stock: p.inventory?.quantity ?? p.stock ?? 0,
    specs: p.specs || p.description || "",
    image: mainImage,
    images: imageList,
    badge: discount > 0 ? `-${discount}%` : undefined,
    isNew: !!(p.isNew),
    isTrending: !!(p.isTrending),
    isBestSeller: !!(p.isBestSeller),
    isFeatured: !!(p.isFeatured),
    isFlashSale: !!(p.isFlashSale),
  };
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchProducts(
  params: {
    take?: number;
    skip?: number;
    categoryId?: string;
    categorySlug?: string;
    search?: string;
    featured?: boolean;
    isFlashSale?: boolean;
    popularity?: "trending" | "bestseller" | "new" | "hot" | "sale";
  } = {}
): Promise<Product[]> {
  const qs = new URLSearchParams();
  if (params.take !== undefined) qs.set("take", String(params.take));
  if (params.skip !== undefined) qs.set("skip", String(params.skip));
  if (params.categoryId) qs.set("categoryId", params.categoryId);
  if (params.categorySlug) qs.set("categorySlug", params.categorySlug);
  if (params.search) qs.set("search", params.search);
  if (params.featured !== undefined) qs.set("featured", String(params.featured));
  if (params.isFlashSale !== undefined) qs.set("isFlashSale", String(params.isFlashSale));
  if (params.popularity) qs.set("popularity", params.popularity);

  const result = await apiFetch<{ data: any[]; meta: any }>(`/api/products?${qs.toString()}`);
  if (!result?.data) return [];
  return result.data.map(normalizeProduct);
}

export async function fetchFlashSaleProducts(): Promise<Product[]> {
  const result = await apiFetch<any[]>("/api/products/flash-sales");
  if (!Array.isArray(result)) return [];
  return result.map(normalizeProduct);
}

export async function fetchFeaturedProducts(take?: number): Promise<Product[]> {
  const qs = take ? `?take=${take}` : "";
  const result = await apiFetch<any[]>(`/api/products/featured${qs}`);
  if (!Array.isArray(result)) return [];
  return result.map(normalizeProduct);
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const result = await apiFetch<any>(`/api/products/${id}`);
  if (!result || !result.id) return null;
  return normalizeProduct(result);
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const result = await apiFetch<ApiCategory[]>("/api/categories");
  if (!Array.isArray(result)) return [];
  return result;
}

export async function fetchHomepageCategories(): Promise<ApiCategory[]> {
  const result = await apiFetch<ApiCategory[]>("/api/categories/homepage");
  if (!Array.isArray(result)) return [];
  return result;
}

export async function fetchBrands(): Promise<ApiBrand[]> {
  const result = await apiFetch<ApiBrand[]>("/api/brands");
  if (!Array.isArray(result)) return [];
  return result;
}

export async function fetchBanners(): Promise<ApiBanner[]> {
  const result = await apiFetch<ApiBanner[]>("/api/cms/banners");
  if (!Array.isArray(result)) return [];
  return result.filter((b) => b.isActive);
}
