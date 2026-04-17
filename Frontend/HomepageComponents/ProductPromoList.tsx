import Link from 'next/link';

interface ProductPromoItem {
  title: string;
  subtitle: string;
  linkText: string;
  imageUrl: string;
  link: string;
  backgroundColor: string;
  textColor: string;
}

interface ProductPromoListProps {
  config: {
    items: ProductPromoItem[];
  };
}

export default function ProductPromoList({ config }: ProductPromoListProps) {
  return (
    <section className="w-full py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-6">
          {config.items.map((item, index) => (
            <Link key={index} href={item.link} className="block">
              <div
                className="rounded-xl overflow-hidden p-6 md:p-10"
                style={{ backgroundColor: item.backgroundColor }}
              >
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div style={{ color: item.textColor }}>
                    <h3 className="text-2xl md:text-3xl font-bold mb-3">{item.title}</h3>
                    <p className="text-lg md:text-xl mb-4">{item.subtitle}</p>
                    <p className="text-lg font-medium hover:underline">{item.linkText}</p>
                  </div>
                  {item.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="max-h-64 w-auto object-contain"
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
