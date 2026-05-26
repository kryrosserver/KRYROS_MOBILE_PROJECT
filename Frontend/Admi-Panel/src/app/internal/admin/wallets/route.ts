export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";
import { proxyGet } from "@/lib/proxy";

export async function GET() {
  const token = (await cookies()).get("admin_token")?.value || "";
  return proxyGet(`${API_BASE}/wallet/manage`, token);
}
