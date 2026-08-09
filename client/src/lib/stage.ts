import type { PipelineStage } from "../types/domain";

export const PIPELINE_STAGES: PipelineStage[] = ["queued", "building", "deploying", "starting", "health_check", "healthy", "live"];

export const STAGE_LABEL: Record<PipelineStage, string> = {
  queued: "Queued",
  building: "Building",
  deploying: "Deploying",
  starting: "Starting",
  health_check: "Health Check",
  healthy: "Healthy",
  live: "Live",
  failed: "Failed",
};

export function stageIndex(stage: PipelineStage): number {
  return PIPELINE_STAGES.indexOf(stage);
}

export function stageStatus(stage: PipelineStage, target: PipelineStage): "done" | "active" | "pending" | "failed" {
  if (stage === "failed") {
    return "pending";
  }
  const cur = stageIndex(stage);
  const t = stageIndex(target);
  if (cur > t) return "done";
  if (cur === t) return "active";
  return "pending";
}

export const STAGE_COLOR: Record<PipelineStage, string> = {
  queued: "var(--color-text-faint)",
  building: "var(--color-signal-amber)",
  deploying: "var(--color-signal-amber)",
  starting: "var(--color-signal-sky)",
  health_check: "var(--color-signal-sky)",
  healthy: "var(--color-signal-emerald)",
  live: "var(--color-signal-emerald)",
  failed: "var(--color-signal-rose)",
};
