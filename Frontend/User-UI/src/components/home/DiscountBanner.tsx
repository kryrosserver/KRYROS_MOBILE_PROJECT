"use client";

import Link from "next/link";

interface DiscountBannerProps {
  section: any;
}

export function DiscountBanner({ section }: DiscountBannerProps) {
  const config = section.config || {};
  const imageUrl = config.backgroundImageUrl || section.imageUrl;
  const link = config.buttonLink || section.link;

  return (
    <div className="container-custom py-4 md:py-6">
      {link ? (
        <Link href={link} className="block">
          <div className="rounded-2xl overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={config.title || section.title || "Discount"}
                className="w-full h-auto"
              />
            ) : (
              <div className="bg-slate-900 h-96 flex items-center justify-center">
                <p className="text-slate-400">No image</p>
              </div>
            )}
          </div>
        </Link>
      ) : (
        <div className="rounded-2xl overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={config.title || section.title || "Discount"}
              className="w-full h-auto"
            />
          ) : (
            <div className="bg-slate-900 h-96 flex items-center justify-center">
              <p className="text-slate-400">No image</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
