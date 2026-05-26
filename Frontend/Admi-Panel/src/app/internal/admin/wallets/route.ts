export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { proxyGet } from "@/lib/proxy";
import { API_BASE, isApiConfigured } from "@/lib/config";
export async function GET() {
  const token = (await cookies()).get("admin_token")?.value || "";
  return proxyGet(`${API_BASE}/wallet/manage`, token);
}
