/**
 * AdminUI — Shared design system for all KRYROS admin pages
 * Provides consistent tokens, layout shells, and reusable components.
 */
import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
export const T = {
  bg:       "#F8F9FA",
  card:     "#FFFFFF",
  border:   "#E5E7EB",
  hover:    "#F9FAFB",
  accent:   "#6366F1",
  orange:   "#F97316",
  green:    "#22C55E",
  red:      "#EF4444",
  amber:    "#F59E0B",
  blue:     "#3B82F6",
  violet:   "#8B5CF6",
  text:     "#111827",
  text2:    "#4B5563",
  text3:    "#9CA3AF",
  sidebar:  "#12172B",
} as const;

/* ─────────────────────────────────────────────
   PAGE SHELL — wraps all page content
───────────────────────────────────────────── */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", padding: "24px" }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE HEADER — title + breadcrumb + actions
───────────────────────────────────────────── */
interface Crumb { label: string; href?: string }
interface PageHeaderProps {
  title: string;
  crumbs?: Crumb[];
  actions?: React.ReactNode;
}
export function PageHeader({ title, crumbs = [], actions }: PageHeaderProps) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      marginBottom: 20, gap: 16, flexWrap: "wrap",
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: 0, lineHeight: 1.2 }}>{title}</h1>
        {crumbs.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12, color: T.text3 }}>
            <Link href="/admin" style={{ color: T.text3, textDecoration: "none" }}>Home</Link>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                <ChevronRight size={12} />
                {c.href
                  ? <Link href={c.href} style={{ color: i === crumbs.length - 1 ? T.accent : T.text3, textDecoration: "none" }}>{c.label}</Link>
                  : <span style={{ color: i === crumbs.length - 1 ? T.accent : T.text3 }}>{c.label}</span>
                }
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {actions}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   CARD — clean white card
───────────────────────────────────────────── */
interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number | string;
}
export function Card({ children, style, padding = "20px 24px" }: CardProps) {
  return (
    <div style={{
      background: T.card,
      border: `1px solid ${T.border}`,
      borderRadius: 12,
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      padding,
      ...style,
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────── */
interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  up?: boolean;
  color?: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}
export function StatCard({ label, value, change, up = true, color = T.accent, icon: Icon }: StatCardProps) {
  return (
    <Card padding="18px 20px">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={20} color={color} />
        </div>
        {change && (
          <span style={{ fontSize: 11, fontWeight: 700, color: up ? T.green : T.red, background: up ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", padding: "3px 8px", borderRadius: 99 }}>
            {up ? "▲" : "▼"} {change}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: T.text2, marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: T.text, lineHeight: 1 }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   STYLED TABLE SHELL
───────────────────────────────────────────── */
interface StyledTableProps {
  headers: string[];
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export function StyledTable({ headers, children, style }: StyledTableProps) {
  return (
    <div style={{ overflowX: "auto", ...style }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead>
          <tr style={{ background: T.hover, borderBottom: `1px solid ${T.border}` }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: "11px 16px", fontSize: 11, fontWeight: 700,
                color: T.text2, textTransform: "uppercase", letterSpacing: "0.07em",
                textAlign: "left", whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TABLE ROW
───────────────────────────────────────────── */
export function TR({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <tr
      style={{ borderBottom: `1px solid ${T.border}`, background: hovered ? T.hover : "transparent", cursor: onClick ? "pointer" : "default" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

/* ─────────────────────────────────────────────
   TABLE CELL
───────────────────────────────────────────── */
export function TD({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: "13px 16px", fontSize: 13, color: T.text, verticalAlign: "middle", ...style }}>
      {children}
    </td>
  );
}

/* ─────────────────────────────────────────────
   BADGE / STATUS PILL
───────────────────────────────────────────── */
const badgeColorMap: Record<string, [string, string]> = {
  active:     [T.green,  "rgba(34,197,94,0.1)"],
  completed:  [T.green,  "rgba(34,197,94,0.1)"],
  delivered:  [T.green,  "rgba(34,197,94,0.1)"],
  paid:       [T.green,  "rgba(34,197,94,0.1)"],
  enabled:    [T.green,  "rgba(34,197,94,0.1)"],
  success:    [T.green,  "rgba(34,197,94,0.1)"],
  verified:   [T.green,  "rgba(34,197,94,0.1)"],
  published:  [T.green,  "rgba(34,197,94,0.1)"],
  inactive:   [T.red,    "rgba(239,68,68,0.1)"],
  cancelled:  [T.red,    "rgba(239,68,68,0.1)"],
  failed:     [T.red,    "rgba(239,68,68,0.1)"],
  rejected:   [T.red,    "rgba(239,68,68,0.1)"],
  disabled:   [T.red,    "rgba(239,68,68,0.1)"],
  expired:    [T.red,    "rgba(239,68,68,0.1)"],
  pending:    [T.amber,  "rgba(245,158,11,0.1)"],
  processing: [T.blue,   "rgba(59,130,246,0.1)"],
  confirmed:  [T.blue,   "rgba(59,130,246,0.1)"],
  shipped:    [T.violet, "rgba(139,92,246,0.1)"],
  draft:      [T.text2,  "rgba(107,114,128,0.1)"],
  refunded:   [T.violet, "rgba(139,92,246,0.1)"],
  approved:   [T.blue,   "rgba(59,130,246,0.1)"],
  customer:   [T.text2,  "rgba(107,114,128,0.1)"],
  admin:      [T.accent, "rgba(99,102,241,0.1)"],
  wholesaler: [T.green,  "rgba(34,197,94,0.1)"],
  editor:     [T.blue,   "rgba(59,130,246,0.1)"],
};
interface BadgeProps { label: string; variant?: string; color?: string; bg?: string }
export function Badge({ label, variant, color, bg }: BadgeProps) {
  const key = (variant || label).toLowerCase();
  const [c, b] = badgeColorMap[key] || [T.text2, "rgba(107,114,128,0.1)"];
  return (
    <span style={{
      display: "inline-block",
      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
      color: color || c, background: bg || b, whiteSpace: "nowrap",
    }}>{label}</span>
  );
}

/* ─────────────────────────────────────────────
   BUTTONS
───────────────────────────────────────────── */
interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
}
export function Btn({ children, onClick, disabled, variant = "secondary", size = "md", style, type = "button" }: BtnProps) {
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 7,
    border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit", fontWeight: 600,
    borderRadius: 10, transition: "opacity .15s",
    opacity: disabled ? 0.55 : 1,
    whiteSpace: "nowrap",
    fontSize: size === "sm" ? 12 : 13,
    padding: size === "sm" ? "7px 14px" : "9px 18px",
  };
  const variants: Record<string, React.CSSProperties> = {
    primary:   { background: T.accent, color: "#fff", border: "none" },
    secondary: { background: T.card, color: T.text2, border: `1px solid ${T.border}` },
    danger:    { background: T.red, color: "#fff", border: "none" },
    ghost:     { background: "transparent", color: T.text2, border: "none", padding: size === "sm" ? "7px 10px" : "9px 12px" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────
   INPUT
───────────────────────────────────────────── */
interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
  readOnly?: boolean;
  disabled?: boolean;
}
export function Input({ placeholder, value, onChange, type = "text", icon, style, readOnly, disabled }: InputProps) {
  return (
    <div style={{ position: "relative", ...style }}>
      {icon && (
        <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.text3, display: "flex", alignItems: "center" }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        disabled={disabled}
        style={{
          width: "100%", background: T.card, border: `1px solid ${T.border}`,
          borderRadius: 10, padding: icon ? "9px 12px 9px 34px" : "9px 14px",
          fontSize: 13, color: T.text, fontFamily: "inherit", outline: "none",
          transition: "border-color .15s", boxSizing: "border-box",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = T.accent; }}
        onBlur={e => { e.currentTarget.style.borderColor = T.border; }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   SELECT
───────────────────────────────────────────── */
interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  disabled?: boolean;
}
export function Select({ value, onChange, children, style, disabled }: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        background: T.card, border: `1px solid ${T.border}`, borderRadius: 10,
        padding: "9px 32px 9px 14px", fontSize: 13, color: T.text2,
        fontFamily: "inherit", outline: "none", cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

/* ─────────────────────────────────────────────
   FORM FIELD (label + input + error)
───────────────────────────────────────────── */
interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}
export function Field({ label, error, children, hint, required }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: T.text2 }}>
        {label}{required && <span style={{ color: T.red, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && !error && <span style={{ fontSize: 11, color: T.text3 }}>{hint}</span>}
      {error && <span style={{ fontSize: 11, color: T.red }}>{error}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────── */
interface EmptyProps {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}
export function Empty({ icon: Icon, title, desc, action }: EmptyProps) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <Icon size={42} color={T.text3} />
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginTop: 14, marginBottom: 6 }}>{title}</div>
      {desc && <div style={{ fontSize: 13, color: T.text2, marginBottom: 18 }}>{desc}</div>}
      {action}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SKELETON ROWS
───────────────────────────────────────────── */
export function SkeletonRows({ cols = 5, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
          {[...Array(cols)].map((_, j) => (
            <td key={j} style={{ padding: "14px 16px" }}>
              <div style={{ height: 14, borderRadius: 6, background: T.hover, width: j === 0 ? "60%" : j === cols - 1 ? "40%" : "80%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   ERROR ALERT
───────────────────────────────────────────── */
export function ErrorAlert({ message }: { message: string }) {
  return (
    <div style={{
      background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
      borderRadius: 10, padding: "12px 16px", fontSize: 13, color: T.red,
      marginBottom: 16,
    }}>
      {message}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SECTION HEADER inside a card
───────────────────────────────────────────── */
export function SectionHead({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${T.border}`,
      gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: T.text2, marginTop: 3 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   DIVIDER
───────────────────────────────────────────── */
export function Divider() {
  return <div style={{ height: 1, background: T.border, margin: "16px 0" }} />;
}

/* ─────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────── */
export function Avatar({ name, size = 34, color = T.accent }: { name: string; size?: number; color?: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color + "22", color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  );
}

/* ─────────────────────────────────────────────
   PAGINATION
───────────────────────────────────────────── */
interface PaginationProps {
  page: number;
  total: number;
  perPage: number;
  onChange: (p: number) => void;
}
export function Pagination({ page, total, perPage, onChange }: PaginationProps) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: `1px solid ${T.border}` }}>
      <span style={{ fontSize: 12, color: T.text2 }}>
        Showing {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total}
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        <Btn variant="secondary" size="sm" onClick={() => onChange(page - 1)} disabled={page === 1}>‹ Prev</Btn>
        <Btn variant="secondary" size="sm" onClick={() => onChange(page + 1)} disabled={page === pages}>Next ›</Btn>
      </div>
    </div>
  );
}
