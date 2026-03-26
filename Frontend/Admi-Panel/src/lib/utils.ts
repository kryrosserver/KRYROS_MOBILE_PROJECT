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
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  
  // Get the base backend URL (without /api)
  const rawApi = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-hxfp.onrender.com";
  const baseUrl = rawApi.endsWith("/api") ? rawApi.replace("/api", "") : rawApi;
  
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}
