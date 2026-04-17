import Link from 'next/link';

interface DiscountBannerProps {
  config: {
    discountText: string;
    discountTextColor: string;
    title: string;
    titleColor: string;
    buttonText: string;
    buttonLink: string;
    buttonColor: string;
    buttonTextColor: string;
    backgroundImageUrl: string;
    backgroundColor: string;
    overlayColor: string;
  };
}

export default function DiscountBanner({ config }: DiscountBannerProps) {
  return (
    <section className="w-full py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-xl overflow-hidden relative"
          style={{ backgroundColor: config.backgroundColor }}
        >
          {config.backgroundImageUrl && (
            <img
              src={config.backgroundImageUrl}
              alt={config.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div
            className="relative z-10 p-8 md:p-12"
            style={{ backgroundColor: config.overlayColor }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h2
                  className="text-5xl md:text-7xl font-bold mb-3"
                  style={{ color: config.discountTextColor }}
                >
                  {config.discountText}
                </h2>
                <p
                  className="text-xl md:text-2xl font-medium"
                  style={{ color: config.titleColor }}
                >
                  {config.title}
                </p>
              </div>
              <Link
                href={config.buttonLink}
                className="px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105"
                style={{
                  backgroundColor: config.buttonColor,
                  color: config.buttonTextColor,
                }}
              >
                {config.buttonText}
                <svg className="w-5 h-5 inline-block ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
