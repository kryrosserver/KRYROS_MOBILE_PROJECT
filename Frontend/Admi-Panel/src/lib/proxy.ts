import { NextResponse } from "next/server";

const BACKEND_TIMEOUT_MS = 28_000;

export async function proxyFetch(
  url: string,
  init: RequestInit = {},
  timeoutMs = BACKEND_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new BackendTimeoutError(url);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export class BackendTimeoutError extends Error {
  constructor(url: string) {
    super(`Backend timeout — the server is starting up. Try again in a few seconds. (${url})`);
    this.name = "BackendTimeoutError";
  }
}

export function timeoutError(url: string): NextResponse {
  return NextResponse.json(
    {
      error: "backend_timeout",
      message:
        "The backend server is starting up (free-tier cold start). Please wait a moment and refresh.",
    },
    { status: 503 }
  );
}

export async function proxyGet(
  backendUrl: string,
  token: string,
  extraHeaders: Record<string, string> = {}
): Promise<NextResponse> {
  try {
    const res = await proxyFetch(backendUrl, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
      },
      cache: "no-store",
    });
    const text = await res.text();
    if (!res.ok) {
      return NextResponse.json({ error: text || "Upstream error" }, { status: res.status });
    }
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      return NextResponse.json({ error: "Invalid JSON from backend", raw: text }, { status: 502 });
    }
  } catch (err: unknown) {
    if (err instanceof BackendTimeoutError) {
      return timeoutError(backendUrl);
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
