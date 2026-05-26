export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { API_BASE } from "@/lib/config";
import { proxyGet } from "@/lib/proxy";

export async function GET() {
  return proxyGet(`${API_BASE}/brands`, "");
}
