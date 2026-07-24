import Image from "next/image";
import { cn } from "@/lib/cn";

type LogoVariant = "icon" | "wordmark" | "compact";
type LogoSurface = "light" | "dark";

interface HPhsarLogoProps {
  variant?: LogoVariant;
  surface?: LogoSurface;
  className?: string;
  priority?: boolean;
}

const LOGO_DIMENSIONS: Record<LogoVariant, { width: number; height: number }> = {
  icon: { width: 40, height: 40 },
  compact: { width: 128, height: 36 },
  wordmark: { width: 168, height: 44 },
};

export function HPhsarLogo({
  variant = "wordmark",
  surface = "light",
  className,
  priority = false,
}: HPhsarLogoProps) {
  const dimensions = LOGO_DIMENSIONS[variant];
  const iconOnly = variant === "icon";
  const src = iconOnly
    ? surface === "dark"
      ? "/logo/icon-white.png"
      : "/logo/icon.png"
    : "/logo/lockup.png";

  return (
    <Image
      src={src}
      width={dimensions.width}
      height={dimensions.height}
      alt={iconOnly ? "H-Phsar" : "H-Phsar Commerce"}
      className={cn(
        "h-auto object-contain",
        variant === "compact" && "max-w-32",
        surface === "dark" && !iconOnly && "brightness-0 invert",
        className,
      )}
      priority={priority}
    />
  );
}
