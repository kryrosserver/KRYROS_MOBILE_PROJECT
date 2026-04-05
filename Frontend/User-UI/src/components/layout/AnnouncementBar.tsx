"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"
import { cmsApi } from "@/lib/api"

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Fetch announcement bar config from admin
    cmsApi.getFooterConfig().then(res => {
      if (res.data && res.data.announcementBarEnabled) {
        // Check session storage to see if closed in current session
        const isClosed = sessionStorage.getItem("announcement_closed");
        if (!isClosed) {
          setConfig(res.data);
          setIsVisible(true);
        }
      }
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcement_closed", "true");
  };

  if (!isVisible || !config) return null;

  // Determine if background and text color are HEX codes or Tailwind classes
  const isBgHex = config.announcementBarBgColor?.startsWith('#');
  const isTextHex = config.announcementBarTextColor?.startsWith('#');

  return (
    <div 
      className="py-2 px-4 relative overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: isBgHex ? config.announcementBarBgColor : undefined,
      }}
    >
      <div 
        className={`container-custom flex items-center justify-center min-h-[24px] ${!isBgHex ? (config.announcementBarBgColor || 'bg-kryros-dark') : ''} ${!isTextHex ? (config.announcementBarTextColor || 'text-kryros-green') : ''}`}
        style={{
          color: isTextHex ? config.announcementBarTextColor : undefined
        }}
      >
        {config.announcementBarLink ? (
          <Link href={config.announcementBarLink} className="text-[11px] md:text-sm font-bold tracking-wide text-center px-8 uppercase hover:underline">
            {config.announcementBarText}
          </Link>
        ) : (
          <p className="text-[11px] md:text-sm font-bold tracking-wide text-center px-8 uppercase">
            {config.announcementBarText?.toUpperCase()}
          </p>
        )}
        <button 
          onClick={handleClose}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </button>
      </div>
    </div>
  );
}
