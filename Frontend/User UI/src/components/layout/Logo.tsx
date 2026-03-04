import Image from 'next/image';
import Link from 'next/link';

export function Logo({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div style={{ width: size, height: size }} className="relative">
        <Image
          src="/logo.jpeg"
          alt="KRYROS"
          fill
          className="object-contain rounded-lg"
          priority
        />
      </div>
    </Link>
  );
}
