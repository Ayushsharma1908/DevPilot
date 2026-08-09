import clsx from "clsx";
import type { ReactNode } from "react";

export type GridVariant = "landing" | "architecture" | "config" | "deployment" | "recovery" | "subtle";

export interface BackgroundGridProps {
  variant?: GridVariant;
  className?: string;
  children?: ReactNode;
}

export function BackgroundGrid({ variant = "subtle", className, children }: BackgroundGridProps) {
  const gridClasses: Record<GridVariant, string> = {
    landing: "bg-grid-wide",
    architecture: "bg-grid-medium",
    config: "bg-grid-dots",
    deployment: "bg-grid-wide",
    recovery: "bg-grid-dense",
    subtle: "bg-grid-medium",
  };

  const glowStyles: Record<GridVariant, string> = {
    landing: "radial-gradient(900px circle at 50% -10%, rgba(99, 102, 241, 0.14), transparent 70%)",
    architecture: "radial-gradient(800px circle at 80% 10%, rgba(99, 102, 241, 0.1), transparent 60%), radial-gradient(600px circle at 10% 40%, rgba(14, 165, 233, 0.06), transparent 60%)",
    config: "radial-gradient(700px circle at 50% 0%, rgba(99, 102, 241, 0.08), transparent 70%)",
    deployment: "radial-gradient(800px circle at 50% -20%, rgba(16, 185, 129, 0.08), transparent 60%)",
    recovery: "radial-gradient(800px circle at 50% -10%, rgba(239, 68, 68, 0.08), transparent 60%)",
    subtle: "radial-gradient(700px circle at 50% 0%, rgba(99, 102, 241, 0.06), transparent 70%)",
  };

  return (
    <div className={clsx("relative min-h-full w-full", className)}>
      {/* Technical Grid Pattern */}
      <div
        className={clsx(
          "pointer-events-none absolute inset-0 opacity-100",
          gridClasses[variant]
        )}
        style={{
          maskImage: "linear-gradient(to bottom, black 20%, transparent 95%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 20%, transparent 95%)",
        }}
      />

      {/* Subtle Radial Ambient Lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: glowStyles[variant],
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default BackgroundGrid;
