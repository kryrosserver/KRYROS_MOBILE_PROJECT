export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { proxyGet } from "@/lib/proxy";
import { API_BASE, isApiConfigured } from "@/lib/config";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "year";
  const token = (await cookies()).get("admin_token")?.value || "";
  return proxyGet(
    `${API_BASE}/reports/summary?range=${encodeURIComponent(range)}`,
    token
  );
}
