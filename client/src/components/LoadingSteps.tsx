import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import clsx from "clsx";

export interface LoadingStepsProps {
  title: string;
  steps: string[];
  durationPerStep?: number;
  className?: string;
}

export function LoadingSteps({
  title,
  steps,
  durationPerStep = 900,
  className,
}: LoadingStepsProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, durationPerStep);

    return () => clearInterval(interval);
  }, [steps.length, durationPerStep]);

  return (
    <div
      className={clsx(
        "rounded-xl border border-[#1e2638] bg-[#0d1017] p-6 shadow-xl relative overflow-hidden",
        className
      )}
    >
      {/* Top ambient highlight */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <Loader2 size={16} className="animate-spin" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm text-[#f0f3f8]">{title}</h3>
          <p className="text-xs text-[#8e98aa]">Please wait while DevPilot processes your request</p>
        </div>
      </div>

      <div className="space-y-3 font-mono text-xs">
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-300",
                isDone && "border-emerald-500/20 bg-emerald-500/5 text-emerald-300",
                isCurrent && "border-indigo-500/30 bg-indigo-500/10 text-[#f0f3f8] shadow-sm",
                isPending && "border-transparent text-[#556075] opacity-60"
              )}
            >
              <div
                className={clsx(
                  "h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-sans transition-colors",
                  isDone && "bg-emerald-500 text-black font-bold",
                  isCurrent && "border border-indigo-400 text-indigo-300 animate-pulse",
                  isPending && "border border-[#1e2638] text-[#556075]"
                )}
              >
                {isDone ? <Check size={11} strokeWidth={3} /> : idx + 1}
              </div>
              <span className="truncate flex-1">{step}</span>
              {isCurrent && <Loader2 size={12} className="animate-spin text-indigo-400 shrink-0" />}
              {isDone && <span className="text-[10px] text-emerald-400">DONE</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LoadingSteps;
