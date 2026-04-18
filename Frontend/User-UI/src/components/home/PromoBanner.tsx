"use client";

import Link from "next/link";

interface PromoBannerProps {
  section: any;
}

export function PromoBanner({ section }: PromoBannerProps) {
  return (
    <div className="container-custom py-4 md:py-6">
      {section.link ? (
        <Link href={section.link} className="block">
          <div className="rounded-2xl overflow-hidden">
            {section.imageUrl ? (
              <img
                src={section.imageUrl}
                alt={section.title || "Promo"}
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
          {section.imageUrl ? (
            <img
              src={section.imageUrl}
              alt={section.title || "Promo"}
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
