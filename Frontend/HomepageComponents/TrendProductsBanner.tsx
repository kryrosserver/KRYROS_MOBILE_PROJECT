import Link from 'next/link';

interface TrendProductsBannerProps {
  config: {
    badges: { label: string; color: string }[];
    title: string;
    featuredProducts: string[];
    buttonText: string;
    buttonLink: string;
    imageUrl: string;
    backgroundColor: string;
    textColor: string;
  };
}

export default function TrendProductsBanner({ config }: TrendProductsBannerProps) {
  return (
    <section className="w-full py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-xl overflow-hidden p-8 md:p-12"
          style={{ backgroundColor: config.backgroundColor }}
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div style={{ color: config.textColor }}>
              <div className="flex flex-wrap gap-3 mb-6">
                {config.badges.map((badge, index) => (
                  <span
                    key={index}
                    className="px-6 py-2 rounded-full font-bold"
                    style={{ backgroundColor: badge.color, color: '#ffffff' }}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-6">{config.title}</h3>
              <ul className="space-y-2 mb-8">
                {config.featuredProducts.map((product, index) => (
                  <li key={index} className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{product}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={config.buttonLink}
                className="inline-flex items-center px-8 py-4 rounded-full font-bold text-lg hover:opacity-90"
                style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
              >
                {config.buttonText}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            {config.imageUrl && (
              <div className="flex justify-center">
                <img
                  src={config.imageUrl}
                  alt={config.title}
                  className="max-h-80 w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
