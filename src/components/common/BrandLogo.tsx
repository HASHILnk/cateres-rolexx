import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
  light?: boolean;
  layout?: "horizontal" | "vertical";
  variant?: "full" | "emblem" | "image";
}

export function BrandLogo({
  size = "md",
  showTagline = true,
  className = "",
  light = false,
  layout = "horizontal",
  variant = "full",
}: BrandLogoProps) {
  // If variant === "image", show the full official logo image directly
  if (variant === "image") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={light ? "/images/rolex-logo.png" : "/images/rolex-logo-transparent.png"}
          alt="ROLEX Events & Caterers"
          className={`${
            size === "sm" ? "h-11" : size === "lg" ? "h-24" : "h-16"
          } w-auto object-contain mx-auto`}
        />
      </div>
    );
  }

  // Vertical layout (e.g. desktop sidebar) - display the full official logo image
  if (layout === "vertical") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <img
          src={light ? "/images/rolex-logo.png" : "/images/rolex-logo-transparent.png"}
          alt="ROLEX Events & Caterers"
          className={`${
            size === "sm" ? "h-14" : size === "lg" ? "h-24" : "h-20"
          } w-auto object-contain mx-auto drop-shadow-sm transition-transform duration-300 hover:scale-105`}
        />
      </div>
    );
  }

  // Horizontal layout (e.g. mobile top header, quotation modal, navbar)
  const emblemSizes = {
    sm: "h-7 sm:h-8",
    md: "h-9 sm:h-10",
    lg: "h-12 sm:h-14",
  };

  const titleSizes = {
    sm: "text-xs sm:text-sm tracking-[0.2em]",
    md: "text-base sm:text-lg tracking-[0.22em]",
    lg: "text-xl sm:text-2xl tracking-[0.24em]",
  };

  const subtitleSizes = {
    sm: "text-[7.5px] tracking-[0.18em]",
    md: "text-[9px] tracking-[0.2em]",
    lg: "text-[11px] tracking-[0.22em]",
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/images/rolex-emblem.png"
        alt="Rolex Insignia"
        className={`${emblemSizes[size]} w-auto object-contain shrink-0 drop-shadow-xs`}
      />

      <div className="flex flex-col text-left justify-center">
        <div
          className={`font-serif font-bold uppercase leading-tight ${
            light ? "text-[#E5C985]" : "text-[#111215] dark:text-[#E5C985]"
          } ${titleSizes[size]}`}
        >
          Rolex
        </div>
        {showTagline && (
          <div
            className={`font-sans font-semibold uppercase mt-0.5 leading-none ${
              light ? "text-[#C9A45C]" : "text-[#8C6D37] dark:text-[#C9A45C]"
            } ${subtitleSizes[size]}`}
          >
            Events & Caterers
          </div>
        )}
      </div>
    </div>
  );
}
