export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export function resolveImageUrl(url?: string): string {
  if (!url) return "";
  
  // If it's already a full URL or a Data URL (Base64), return it as is
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  
  // If it's a relative path (e.g., /uploads/...), prefix it with the backend URL
  const rawApi = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-hxfp.onrender.com";
  const baseUrl = rawApi.endsWith("/api") ? rawApi.replace("/api", "") : rawApi;
  
  // Clean up double slashes
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${baseUrl}${path}`;
}
