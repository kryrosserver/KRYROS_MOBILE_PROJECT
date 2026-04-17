import Link from 'next/link';

interface PromoBannerProps {
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl: string;
  link: string;
  linkText: string;
  backgroundColor: string;
  textColor: string;
}

export default function PromoBanner({
  title,
  subtitle,
  description,
  imageUrl,
  link,
  linkText,
  backgroundColor,
  textColor,
}: PromoBannerProps) {
  return (
    <section className="w-full py-8 px-4" style={{ backgroundColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="rounded-xl overflow-hidden relative">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto object-cover"
            />
          )}
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6" style={{ color: textColor }}>
            {title && <h2 className="text-3xl md:text-5xl font-bold mb-2">{title}</h2>}
            {subtitle && <h3 className="text-xl md:text-2xl font-semibold mb-2">{subtitle}</h3>}
            {description && <p className="text-lg mb-6 max-w-2xl">{description}</p>}
            <Link href={link} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-full transition-colors">
              {linkText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
