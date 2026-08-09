import { Link } from "react-router-dom";
import { Plus, Rocket, RefreshCcw } from "lucide-react";
import clsx from "clsx";

export interface EmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  actionText?: string;
  actionTo?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Rocket,
  title,
  description,
  actionText,
  actionTo,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center text-center p-10 sm:p-14 rounded-xl border border-dashed border-[#1e2638] bg-[#0d1017]/50",
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-[0_0_16px_rgba(99,102,241,0.15)]">
        <Icon size={22} />
      </div>

      <h3 className="font-display font-semibold text-base text-[#f0f3f8] mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm text-[#8e98aa] max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {actionText && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md hover:from-indigo-500 hover:to-indigo-400 transition-all hover:-translate-y-0.5"
        >
          <Plus size={15} />
          <span>{actionText}</span>
        </Link>
      )}

      {actionText && onAction && !actionTo && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-md hover:from-indigo-500 hover:to-indigo-400 transition-all hover:-translate-y-0.5"
        >
          <RefreshCcw size={14} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}

export default EmptyState;
