import { Cpu, Sparkles } from "lucide-react";
import clsx from "clsx";

export interface AiSourceBadgeProps {
  source: "gemini" | "mock" | null | undefined;
  className?: string;
  size?: "sm" | "md";
}

export function AiSourceBadge({ source, className, size = "md" }: AiSourceBadgeProps) {
  if (!source) return null;

  const isGemini = source === "gemini";

  return (
    <div
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-md border font-mono font-medium transition-colors select-none",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        isGemini
          ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.12)]"
          : "border-amber-500/30 bg-amber-500/10 text-amber-300",
        className
      )}
      title={
        isGemini
          ? "Generated in real-time by Google Gemini 2.5 Flash"
          : "Generated using built-in deterministic offline heuristics (no GEMINI_API_KEY)"
      }
    >
      {isGemini ? (
        <Sparkles size={size === "sm" ? 11 : 13} className="text-indigo-400 shrink-0" />
      ) : (
        <Cpu size={size === "sm" ? 11 : 13} className="text-amber-400 shrink-0" />
      )}
      <span>{isGemini ? "Gemini 2.5 Flash" : "Offline analysis"}</span>
    </div>
  );
}

export default AiSourceBadge;
