"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { Monitor, Tablet, Smartphone, X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type DeviceType = "desktop" | "tablet" | "mobile";

interface DeviceSize {
  width: number;
  label: string;
}

const DEVICE_SIZES: Record<DeviceType, DeviceSize> = {
  desktop: {
    width: 1280,
    label: "Desktop (1024px+)",
  },
  tablet: {
    width: 768,
    label: "Tablet (768px-1023px)",
  },
  mobile: {
    width: 375,
    label: "Mobile (<768px)",
  },
};

// Context for preview state
interface PreviewContextType {
  device: DeviceType;
  isActive: boolean;
}

const PreviewContext = createContext<PreviewContextType>({
  device: "desktop",
  isActive: false,
});

export function usePreview() {
  return useContext(PreviewContext);
}

interface MobilePreviewToggleProps {
  className?: string;
  children?: ReactNode;
}

// Main component with context provider
export function MobilePreviewProvider({ children, className }: MobilePreviewToggleProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isActive, setIsActive] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDeviceChange = useCallback((newDevice: DeviceType) => {
    setDevice(newDevice);
    if (newDevice !== "desktop") {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, []);

  const handleExitPreview = useCallback(() => {
    setIsActive(false);
    setDevice("desktop");
  }, []);

  // Handle escape key to exit preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        handleExitPreview();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, handleExitPreview]);

  // Disable scrolling when in preview mode
  useEffect(() => {
    if (isActive) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isActive]);

  return (
    <PreviewContext.Provider value={{ device, isActive }}>
      {/* Floating Toggle Button */}
      <div
        className={twMerge(
          "fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2",
          className
        )}
      >
        {/* Device Selection Buttons */}
        <div
          className={clsx(
            "flex gap-2 transition-all duration-300 ease-in-out",
            isActive ? "opacity-0 pointer-events-none h-0 overflow-hidden" : "opacity-100"
          )}
        >
          <button
            onClick={() => handleDeviceChange("desktop")}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={clsx(
              "relative flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-200",
              "bg-slate-800 hover:bg-slate-700 border border-slate-600",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
            aria-label="Desktop view"
          >
            <Monitor className="w-5 h-5 text-white" />
            {showTooltip && (
              <span className="absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap">
                Desktop
              </span>
            )}
          </button>

          <button
            onClick={() => handleDeviceChange("tablet")}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={clsx(
              "relative flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-200",
              "bg-slate-800 hover:bg-slate-700 border border-slate-600",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
            aria-label="Tablet view"
          >
            <Tablet className="w-5 h-5 text-white" />
            {showTooltip && (
              <span className="absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap">
                Tablet
              </span>
            )}
          </button>

          <button
            onClick={() => handleDeviceChange("mobile")}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={clsx(
              "relative flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-200",
              "bg-slate-800 hover:bg-slate-700 border border-slate-600",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
            aria-label="Mobile view"
          >
            <Smartphone className="w-5 h-5 text-white" />
            {showTooltip && (
              <span className="absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap">
                Mobile
              </span>
            )}
          </button>
        </div>

        {/* Preview Active Indicator */}
        <div
          className={clsx(
            "transition-all duration-300 ease-in-out",
            isActive ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-lg">
              {DEVICE_SIZES[device].label}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Container Overlay */}
      {isActive && (
        <div
          className="fixed inset-0 z-[9998] overflow-hidden"
          onClick={handleExitPreview}
        >
          {/* Device Frame */}
          <div
            className="relative mx-auto bg-white shadow-2xl transition-all duration-300 ease-in-out overflow-hidden"
            style={{
              width: DEVICE_SIZES[device].width,
              maxWidth: "100vw",
              height: "100vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Device Header */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-slate-100 border-b flex items-center justify-between px-3 z-10">
              <span className="text-xs text-slate-500 font-medium">
                {DEVICE_SIZES[device].label}
              </span>
              <button
                onClick={handleExitPreview}
                className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-200 transition-colors"
                aria-label="Exit preview"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="w-full h-full pt-10 overflow-auto">
              {children}
            </div>

            {/* Device Frame Border */}
            <div
              className={clsx(
                "absolute inset-0 pointer-events-none border-[8px] border-slate-800 rounded-lg"
              )}
            />
          </div>

          {/* Exit Button */}
          <button
            onClick={handleExitPreview}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* Regular content when not in preview */}
      {!isActive && children}
    </PreviewContext.Provider>
  );
}

// Standalone toggle component for use without wrapping content
export function MobilePreviewToggle({ className }: { className?: string }) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [isActive, setIsActive] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleDeviceChange = useCallback((newDevice: DeviceType) => {
    setDevice(newDevice);
    if (newDevice !== "desktop") {
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, []);

  const handleExitPreview = useCallback(() => {
    setIsActive(false);
    setDevice("desktop");
  }, []);

  // Handle escape key to exit preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        handleExitPreview();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, handleExitPreview]);

  // Disable scrolling when in preview mode
  useEffect(() => {
    if (isActive) {
      const originalStyle = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isActive]);

  return (
    <>
      {/* Floating Toggle Button */}
      <div
        className={twMerge(
          "fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2",
          className
        )}
      >
        {/* Device Selection Buttons */}
        <div
          className={clsx(
            "flex gap-2 transition-all duration-300 ease-in-out",
            isActive ? "opacity-0 pointer-events-none h-0 overflow-hidden" : "opacity-100"
          )}
        >
          <button
            onClick={() => handleDeviceChange("desktop")}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={clsx(
              "relative flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-200",
              "bg-slate-800 hover:bg-slate-700 border border-slate-600",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
            aria-label="Desktop view"
          >
            <Monitor className="w-5 h-5 text-white" />
            {showTooltip && (
              <span className="absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap">
                Desktop
              </span>
            )}
          </button>

          <button
            onClick={() => handleDeviceChange("tablet")}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={clsx(
              "relative flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-200",
              "bg-slate-800 hover:bg-slate-700 border border-slate-600",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
            aria-label="Tablet view"
          >
            <Tablet className="w-5 h-5 text-white" />
            {showTooltip && (
              <span className="absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap">
                Tablet
              </span>
            )}
          </button>

          <button
            onClick={() => handleDeviceChange("mobile")}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className={clsx(
              "relative flex items-center justify-center w-12 h-12 rounded-xl shadow-lg transition-all duration-200",
              "bg-slate-800 hover:bg-slate-700 border border-slate-600",
              "hover:scale-105 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            )}
            aria-label="Mobile view"
          >
            <Smartphone className="w-5 h-5 text-white" />
            {showTooltip && (
              <span className="absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-slate-900 rounded whitespace-nowrap">
                Mobile
              </span>
            )}
          </button>
        </div>

        {/* Preview Active Indicator */}
        <div
          className={clsx(
            "transition-all duration-300 ease-in-out",
            isActive ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-lg">
              {DEVICE_SIZES[device].label}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Container Overlay */}
      {isActive && (
        <div
          className="fixed inset-0 z-[9998] flex items-start justify-center pt-16 bg-black/50 overflow-hidden"
          onClick={handleExitPreview}
        >
          {/* Device Frame */}
          <div
            className="relative bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              width: DEVICE_SIZES[device].width,
              maxWidth: "100vw",
              height: "calc(100vh - 8rem)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Device Header */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-slate-100 border-b flex items-center justify-between px-3 z-10">
              <span className="text-xs text-slate-500 font-medium">
                {DEVICE_SIZES[device].label}
              </span>
              <button
                onClick={handleExitPreview}
                className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-slate-200 transition-colors"
                aria-label="Exit preview"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Device Frame Border */}
            <div
              className={clsx(
                "absolute inset-0 pointer-events-none border-4 border-slate-800 rounded-lg",
                device === "mobile" && "w-[calc(100%+12px)] -left-[6px]",
                device === "tablet" && "w-[calc(100%+16px)] -left-[8px]",
                device === "desktop" && "w-[calc(100%+20px)] -left-[10px]"
              )}
              style={{
                height: "calc(100%+8px)",
                top: "-4px",
              }}
            />
          </div>

          {/* Exit Button */}
          <button
            onClick={handleExitPreview}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Exit Preview
          </button>
        </div>
      )}
    </>
  );
}

export default MobilePreviewProvider;
