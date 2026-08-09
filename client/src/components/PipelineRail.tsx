import { PIPELINE_STAGES, STAGE_LABEL, stageStatus } from "../lib/stage";
import type { PipelineStage } from "../types/domain";
import { Check, X, Loader2, Clock, Zap, ShieldCheck, Activity, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

export interface PipelineRailProps {
  stage: PipelineStage;
  failedAt?: PipelineStage;
  compact?: boolean;
  className?: string;
}

export function PipelineRail({ stage, failedAt, compact = false, className }: PipelineRailProps) {
  const failed = stage === "failed";

  const stageIcons: Record<
    PipelineStage,
    React.ComponentType<{ size?: number; className?: string }>
  > = {
    queued: Clock,
    building: Loader2,
    deploying: Activity,
    starting: Zap,
    health_check: ShieldCheck,
    healthy: CheckCircle2,
    live: Check,
    failed: X,
  };

  return (
    <div className={clsx("w-full overflow-x-auto pb-2 scrollbar-none", className)}>
      <div className="flex items-center min-w-[620px] sm:min-w-full px-1">
        {PIPELINE_STAGES.map((s, i) => {
          const status = failed
            ? failedAt && PIPELINE_STAGES.indexOf(s) < PIPELINE_STAGES.indexOf(failedAt)
              ? "done"
              : s === failedAt
                ? "failed"
                : "pending"
            : stageStatus(stage, s);

          const isLast = i === PIPELINE_STAGES.length - 1;
          const StageIcon = stageIcons[s] || Clock;

          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              {/* Stage Node */}
              <div className="flex flex-col items-center gap-2 shrink-0 group">
                <div
                  className={clsx(
                    "flex items-center justify-center rounded-full transition-all duration-300 relative select-none",
                    compact ? "h-7 w-7" : "h-9 w-9",
                    status === "done" && "bg-emerald-500 text-[#080a0f] shadow-[0_0_12px_rgba(16,185,129,0.3)]",
                    status === "active" && "border-2 border-indigo-400 bg-indigo-500/10 text-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.35)]",
                    status === "failed" && "bg-rose-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.3)]",
                    status === "pending" && "border border-[#1e2638] bg-[#11151f] text-[#556075]"
                  )}
                >
                  {status === "done" && <Check size={compact ? 12 : 15} strokeWidth={3} />}
                  {status === "failed" && <X size={compact ? 12 : 15} strokeWidth={3} />}
                  {status === "active" && (
                    <>
                      <StageIcon size={compact ? 13 : 15} className="animate-spin" />
                      <span className="absolute -inset-1 rounded-full border border-indigo-400/40 animate-ping opacity-75" />
                    </>
                  )}
                  {status === "pending" && (
                    <span className="font-mono text-[11px] font-medium">{i + 1}</span>
                  )}
                </div>

                {!compact && (
                  <div className="flex flex-col items-center">
                    <span
                      className={clsx(
                        "text-xs font-mono font-medium whitespace-nowrap transition-colors",
                        status === "done" && "text-emerald-400",
                        status === "active" && "text-indigo-300 font-semibold",
                        status === "failed" && "text-rose-400",
                        status === "pending" && "text-[#556075]"
                      )}
                    >
                      {STAGE_LABEL[s]}
                    </span>
                    {status === "active" && (
                      <span className="text-[10px] text-indigo-400/80 animate-pulse mt-0.5">
                        In progress
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Connecting Rail */}
              {!isLast && (
                <div
                  className="flex-1 h-[2px] mx-2 relative overflow-hidden rounded-full transition-colors"
                  style={{
                    background:
                      status === "done"
                        ? "rgba(16, 185, 129, 0.4)"
                        : "var(--color-border-soft)",
                  }}
                >
                  <div
                    className={clsx(
                      "absolute inset-0 rounded-full transition-all duration-500",
                      status === "done" && "bg-emerald-500",
                      status === "active" && "pulse-rail"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PipelineRail;
