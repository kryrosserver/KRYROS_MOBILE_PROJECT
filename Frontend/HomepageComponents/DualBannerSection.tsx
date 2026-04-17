import Link from 'next/link';

interface Banner {
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  linkText: string;
  imageUrl: string;
  link: string;
  backgroundColor: string;
  textColor: string;
}

interface DualBannerSectionProps {
  config: {
    banners: Banner[];
  };
}

export default function DualBannerSection({ config }: DualBannerSectionProps) {
  return (
    <section className="w-full py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {config.banners.map((banner, index) => (
            <Link key={index} href={banner.link} className="block">
              <div
                className="rounded-xl overflow-hidden p-6 md:p-10"
                style={{ backgroundColor: banner.backgroundColor }}
              >
                <div className="flex flex-col items-start">
                  {banner.badge && (
                    <span
                      className="px-6 py-2 rounded-full font-bold mb-4"
                      style={{ backgroundColor: banner.badgeColor, color: '#ffffff' }}
                    >
                      {banner.badge}
                    </span>
                  )}
                  <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: banner.textColor }}>
                    {banner.title}
                  </h3>
                  <p className="text-lg mb-4" style={{ color: banner.textColor, opacity: 0.8 }}>
                    {banner.subtitle}
                  </p>
                  <p className="text-lg font-medium hover:underline" style={{ color: banner.textColor }}>
                    {banner.linkText}
                  </p>
                  {banner.imageUrl && (
                    <div className="w-full mt-6">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-auto object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
