export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { proxyGet } from "@/lib/proxy";
import { API_BASE, isApiConfigured } from "@/lib/config";
export async function GET() {
  return proxyGet(`${API_BASE}/categories`, "");
}
