"use client";

import { useEffect, useRef, ReactNode } from "react";

const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

export function ScaledPage({ children }: { children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) {
      if (!innerRef.current || !outerRef.current) return;
      outerRef.current.style.height = "auto";
      outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`;
    }
    function recalc() {
      if (!innerRef.current || !outerRef.current) return;
      const vw = outerRef.current.offsetWidth || window.innerWidth;
      const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE;
      const s = Math.min(1, vw / baseW);
      innerRef.current.style.width = `${baseW}px`;
      innerRef.current.style.transform = `scale(${s})`;
      innerRef.current.style.transformOrigin = "top left";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s)));
    }
    recalc();
    const t = setTimeout(recalc, 400);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("resize", recalc);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={outerRef}
      style={{
        overflow: "hidden",
        background: "var(--bg-primary)",
        margin: "-24px",
        width: "calc(100% + 48px)",
      }}
    >
      <div
        ref={innerRef}
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          padding: "24px",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </div>
  );
}
