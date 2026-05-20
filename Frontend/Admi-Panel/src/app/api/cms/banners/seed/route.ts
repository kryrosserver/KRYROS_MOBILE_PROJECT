export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { API_BASE } from "@/lib/config";
import { cookies } from "next/headers";

const DEFAULT_BANNERS = [
  {
    title: "HP EliteBook x360 G8",
    subtitle: "Premium business convertible",
    image: "https://shopinverse.com/cdn/shop/files/hp-elitebook-x360-1040-g8-11th-gen-intel-core-i5-256gb-ssd-16gb-ram-touchscreen-keyboard-light-body-dent-2006936.jpg?v=1755983983&width=1200",
    link: "/shop",
    linkText: "Shop Now",
    position: 1,
    isActive: true,
  },
  {
    title: "HP EliteBook x360 — Touchscreen",
    subtitle: "11th Gen Intel Core performance",
    image: "https://shopinverse.com/cdn/shop/files/hp-elitebook-x360-1040-g8-11th-gen-intel-core-i5-256gb-ssd-16gb-ram-touchscreen-keyboard-light-body-dent-1571390.jpg?v=1755983983&width=1200",
    link: "/shop",
    linkText: "Shop Now",
    position: 2,
    isActive: true,
  },
  {
    title: "EliteBook x360 — Lightweight",
    subtitle: "Elegant design, powerful specs",
    image: "https://shopinverse.com/cdn/shop/files/hp-elitebook-x360-1040-g8-11th-gen-intel-core-i5-256gb-ssd-16gb-ram-touchscreen-keyboard-light-body-dent-7113930.jpg?v=1755983983&width=1200",
    link: "/shop",
    linkText: "Shop Now",
    position: 3,
    isActive: true,
  },
  {
    title: "Gaming Ready Graphics",
    subtitle: "Explore performance laptops",
    image: "https://i.ebayimg.com/images/g/srEAAeSwxIZpIgde/s-l1600.webp",
    link: "/shop",
    linkText: "Explore",
    position: 4,
    isActive: true,
  },
  {
    title: "Workstation Power",
    subtitle: "For creators and pros",
    image: "https://i.ebayimg.com/images/g/gmsAAeSwbWZpIgde/s-l960.webp",
    link: "/shop",
    linkText: "Discover",
    position: 5,
    isActive: true,
  },
];

export async function POST(request: Request) {
  const token = (await cookies()).get("admin_token")?.value || "";
  const payload = await request.json().catch(() => null);
  const banners = Array.isArray(payload?.banners) && payload.banners.length ? payload.banners : DEFAULT_BANNERS;
  const created: any[] = [];
  for (const b of banners) {
    const res = await fetch(`${API_BASE}/cms/banners`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(b),
    });
    if (res.ok) {
      created.push(await res.json());
    } else {
      const txt = await res.text();
      return NextResponse.json({ error: txt || "Failed to create a banner" }, { status: res.status });
    }
  }
  return NextResponse.json({ success: true, created });
}
