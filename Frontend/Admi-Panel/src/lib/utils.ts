export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
}

export function resolveImageUrl(url?: string): string {
  if (!url || typeof url !== 'string') return "";
  
  // If it's already a full URL (http/https), a Data URL (Base64), or a blob URL, return it as is
  if (
    url.startsWith("http") || 
    url.startsWith("https") || 
    url.startsWith("data:") || 
    url.startsWith("blob:") ||
    url.startsWith("//")
  ) {
    return url;
  }
  
  // If it's a relative path (e.g., /uploads/...), prefix it with the backend URL
  const rawApi = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-hxfp.onrender.com";
  // Remove trailing /api if present to get the base server URL
  const baseUrl = rawApi.replace(/\/api$/, "");
  
  // Ensure the path starts with a single slash
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  
  return `${baseUrl}${cleanPath}`;
}
