import Link from 'next/link';

export function Logo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="32" fill="#14B8A6" />
        <g fill="none" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 18 L22 46" />
          <path d="M25 32 L42 18" />
          <path d="M25 32 C42 32 45 40 38 44 C34 46 29 44 30 40" />
        </g>
      </svg>
      <span className="text-xl font-bold text-slate-900">KRYROS</span>
    </Link>
  );
}
