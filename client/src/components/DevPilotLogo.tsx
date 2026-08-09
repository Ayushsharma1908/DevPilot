import clsx from "clsx";

export interface DevPilotLogoProps {
  compact?: boolean;
  size?: "sm" | "md" | "lg";
  withBadge?: string;
  className?: string;
}

export function DevPilotLogo({
  compact = false,
  size = "md",
  withBadge,
  className,
}: DevPilotLogoProps) {
  const iconSizes = {
    sm: "h-5 w-5 rounded",
    md: "h-6 w-6 rounded-md",
    lg: "h-8 w-8 rounded-lg",
  };

  const svgSizes = {
    sm: 11,
    md: 13,
    lg: 18,
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-[15px]",
    lg: "text-lg",
  };

  return (
    <div className={clsx("flex items-center gap-2.5 font-display font-semibold select-none", className)}>
      <div
        className={clsx(
          "flex items-center justify-center shadow-sm relative overflow-hidden shrink-0",
          iconSizes[size]
        )}
        style={{
          background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
          boxShadow: "0 0 16px rgba(99, 102, 241, 0.35)",
        }}
      >
        {/* Precision geometry mark representing infrastructure pipelines */}
        <svg
          width={svgSizes[size]}
          height={svgSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 12L10 6M4 12L10 18M4 12H14M14 12L20 6M14 12L20 18"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {!compact && (
        <div className="flex items-center gap-2">
          <span className={clsx("tracking-tight text-[#f0f3f8]", textSizes[size])}>
            DevPilot
          </span>
          {withBadge && (
            <span className="rounded border border-indigo-500/30 bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-mono font-medium text-indigo-300">
              {withBadge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Alias for backward compatibility if any file imports Logo
export const Logo = DevPilotLogo;
export default DevPilotLogo;
