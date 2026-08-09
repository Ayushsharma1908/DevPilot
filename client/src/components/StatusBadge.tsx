import type { PipelineStage } from "../types/domain";
import { STAGE_LABEL } from "../lib/stage";
import { Check, X, Loader2, Clock, Activity, ShieldCheck, Zap } from "lucide-react";
import clsx from "clsx";

export interface StatusBadgeProps {
  stage: PipelineStage;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ stage, className, size = "md" }: StatusBadgeProps) {
  const isPulsing = stage === "building" || stage === "deploying" || stage === "starting" || stage === "health_check";

  const stageConfig: Record<
    PipelineStage,
    {
      icon: React.ComponentType<{ size?: number; className?: string }>;
      bg: string;
      border: string;
      text: string;
      dot: string;
    }
  > = {
    queued: {
      icon: Clock,
      bg: "bg-slate-500/10",
      border: "border-slate-500/30",
      text: "text-slate-400",
      dot: "bg-slate-400",
    },
    building: {
      icon: Loader2,
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      dot: "bg-amber-400",
    },
    deploying: {
      icon: Activity,
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-400",
      dot: "bg-amber-400",
    },
    starting: {
      icon: Zap,
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      text: "text-sky-400",
      dot: "bg-sky-400",
    },
    health_check: {
      icon: ShieldCheck,
      bg: "bg-sky-500/10",
      border: "border-sky-500/30",
      text: "text-sky-400",
      dot: "bg-sky-400",
    },
    healthy: {
      icon: Check,
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-400",
      dot: "bg-emerald-400",
    },
    live: {
      icon: Check,
      bg: "bg-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.15)]",
      border: "border-emerald-500/40",
      text: "text-emerald-300",
      dot: "bg-emerald-400",
    },
    failed: {
      icon: X,
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      text: "text-rose-400",
      dot: "bg-rose-400",
    },
  };

  const config = stageConfig[stage] || stageConfig.queued;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-tight select-none transition-all",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        config.bg,
        config.border,
        config.text,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5 items-center justify-center">
        {isPulsing && (
          <span className={clsx("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", config.dot)} />
        )}
        <span className={clsx("relative inline-flex h-1.5 w-1.5 rounded-full", config.dot)} />
      </span>
      <span>{STAGE_LABEL[stage] || stage}</span>
    </span>
  );
}

export default StatusBadge;
