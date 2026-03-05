import Link from 'next/link';

export function Logo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="rounded-lg"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="20" fill="url(#grad)"/>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981"/>
            <stop offset="100%" stopColor="#059669"/>
          </linearGradient>
        </defs>
        <text x="50" y="65" fontFamily="Arial, sans-serif" fontSize="50" fontWeight="bold" fill="white" textAnchor="middle">K</text>
      </svg>
      <span className="text-xl font-bold text-slate-900">KRYROS</span>
    </Link>
  );
}
