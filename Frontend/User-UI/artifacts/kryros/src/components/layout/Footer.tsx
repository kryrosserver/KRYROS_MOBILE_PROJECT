import { Link } from "wouter";

const links = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Refund Policy", href: "/refund" },
  { label: "Returns & Exchange", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background py-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-3">
        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {links.map(({ label, href }, i) => (
            <span key={label} className="flex items-center gap-4">
              <Link href={href}>
                <span className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  {label}
                </span>
              </Link>
              {i < links.length - 1 && (
                <span className="text-border text-xs select-none">·</span>
              )}
            </span>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs text-muted-foreground">
          &copy; 2026 KRYROS Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
