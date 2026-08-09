import type { ReactNode } from "react";
import clsx from "clsx";
import BackButton from "./BackButton";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  onBack?: () => void;
  badge?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  backTo,
  backLabel,
  onBack,
  badge,
  action,
  className,
}: PageHeaderProps) {
  const showBack = Boolean(backTo || onBack);

  return (
    <div
      className={clsx(
        "border-b border-[#1e2638] bg-[#0d1017]/70 backdrop-blur-md px-4 sm:px-8 py-4 mb-6 sm:mb-8 transition-colors",
        className
      )}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          {showBack && (
            <BackButton to={backTo} label={backLabel} onClick={onBack} className="shrink-0 mt-0.5 sm:mt-0" />
          )}

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display font-semibold text-lg sm:text-xl text-[#f0f3f8] leading-tight">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-[#8e98aa] mt-1 font-sans leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center flex-wrap">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
