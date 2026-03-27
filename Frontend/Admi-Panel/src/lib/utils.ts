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
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return "";

  // If it's already a full URL (http/https), a Data URL (Base64), or a blob URL, return it as is
  if (
    trimmedUrl.startsWith("http") || 
    trimmedUrl.startsWith("https") || 
    trimmedUrl.startsWith("data:") || 
    trimmedUrl.startsWith("blob:") ||
    trimmedUrl.startsWith("//") ||
    trimmedUrl.startsWith("www.")
  ) {
    // If it starts with www., prepend https:// for safety if needed, 
    // though browsers often handle // and www. differently.
    // For simplicity, let's just return it if it looks absolute.
    return trimmedUrl.startsWith("www.") ? `https://${trimmedUrl}` : trimmedUrl;
  }
  
  // If it's a relative path (e.g., /uploads/...), prefix it with the backend URL
  const rawApi = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-hxfp.onrender.com";
  // Remove trailing /api if present to get the base server URL
  const baseUrl = rawApi.replace(/\/api$/, "");
  
  // Ensure the path starts with a single slash
  const cleanPath = trimmedUrl.startsWith("/") ? trimmedUrl : `/${trimmedUrl}`;
  
  return `${baseUrl}${cleanPath}`;
}
