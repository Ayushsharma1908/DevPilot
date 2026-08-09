import { AlertTriangle, RefreshCcw, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import clsx from "clsx";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  backTo?: string;
  backLabel?: string;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  backTo = "/app",
  backLabel = "Back to Overview",
  className,
}: ErrorStateProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 sm:p-8 max-w-xl mx-auto shadow-lg relative overflow-hidden text-center sm:text-left",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
          <AlertTriangle size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base text-[#f0f3f8] mb-1">{title}</h3>
          <p className="text-xs sm:text-sm text-[#8e98aa] leading-relaxed mb-5 font-mono break-words">
            {message}
          </p>

          <div className="flex items-center gap-3 justify-center sm:justify-start flex-wrap">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2638] bg-[#11151f] px-3.5 py-2 text-xs font-medium text-[#f0f3f8] hover:bg-[#161b28] hover:border-[#2a354c] transition-colors"
              >
                <RefreshCcw size={13} />
                <span>Retry</span>
              </button>
            )}

            {backTo && (
              <Link
                to={backTo}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3.5 py-2 text-xs font-medium text-[#8e98aa] hover:text-[#f0f3f8] hover:bg-white/10 transition-colors"
              >
                <ArrowLeft size={13} />
                <span>{backLabel}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorState;
