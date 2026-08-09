import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCcw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wrench,
  XCircle,
} from "lucide-react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { PipelineRail } from "../components/PipelineRail";
import { StatusBadge } from "../components/StatusBadge";
import { AiSourceBadge } from "../components/AiSourceBadge";
import { BackgroundGrid } from "../components/BackgroundGrid";
import { LogViewer } from "../components/LogViewer";
import { EmptyState } from "../components/EmptyState";
import type { PipelineStage } from "../types/domain";
import clsx from "clsx";

const TERMINAL_STAGES = new Set(["live", "failed"]);

const STAGE_EXPLANATIONS: Record<PipelineStage, { title: string; desc: string }> = {
  queued: {
    title: "Deployment Queued",
    desc: "Allocating Zerops container resources and preparing the environment.",
  },
  building: {
    title: "Building Application Artifacts",
    desc: "Executing build commands, installing dependencies, and compiling containers.",
  },
  deploying: {
    title: "Deploying to Zerops Network",
    desc: "Transferring built artifacts to isolated Zerops runtime containers.",
  },
  starting: {
    title: "Starting Container Services",
    desc: "Launching runtime processes and executing startup hooks.",
  },
  health_check: {
    title: "Executing Automated Health Checks",
    desc: "Validating HTTP readiness, port availability, and process health.",
  },
  healthy: {
    title: "Services Verified Healthy",
    desc: "All health probes passed successfully. Finalizing ingress routing.",
  },
  live: {
    title: "Application is Live & Verified",
    desc: "Public traffic is actively routed to your healthy Zerops services.",
  },
  failed: {
    title: "Deployment Interrupted",
    desc: "An error occurred during pipeline execution. Review diagnosis below.",
  },
};

export function DeploymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const deploymentQuery = useQuery({
    queryKey: ["deployment", id],
    queryFn: () => api.getDeployment(id!),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data && TERMINAL_STAGES.has(query.state.data.deployment.stage) ? false : 1200,
  });

  const deployment = deploymentQuery.data?.deployment;

  const verifyMutation = useMutation({
    mutationFn: () => api.verifyDeployment(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deployment", id] }),
  });

  const diagnoseMutation = useMutation({
    mutationFn: () => api.diagnoseDeployment(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deployment", id] }),
  });

  const retryMutation = useMutation({
    mutationFn: () => api.retryDeployment(id!),
    onSuccess: (data) => navigate(`/app/deployments/${data.deployment.id}`),
  });

  if (!id) return null;

  if (deploymentQuery.isLoading) {
    return (
      <BackgroundGrid variant="deployment">
        <div className="h-96 flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-indigo-400" />
          <span className="font-mono text-xs text-[#8e98aa]">Loading deployment status...</span>
        </div>
      </BackgroundGrid>
    );
  }

  if (!deployment) {
    return (
      <BackgroundGrid variant="deployment">
        <div>
          <PageHeader title="Deployment Not Found" backTo="/app/deployments" backLabel="Deployments" />
          <div className="max-w-xl mx-auto px-6 py-12">
            <EmptyState
              title="Deployment Not Found"
              description={`The requested deployment "${id}" could not be located in this session.`}
              actionText="View All Deployments"
              actionTo="/app/deployments"
            />
          </div>
        </div>
      </BackgroundGrid>
    );
  }

  const failed = deployment.stage === "failed";
  const isLive = deployment.stage === "live";
  const inProgress = !TERMINAL_STAGES.has(deployment.stage);
  const canVerify = deployment.stage === "healthy" || deployment.stage === "live" || failed;

  return (
    <BackgroundGrid variant={failed ? "recovery" : "deployment"}>
      <div>
        <PageHeader
          title={deployment.projectName}
          subtitle={`Deployment ${deployment.id} · ${
            deployment.demoMode ? "Demo Mode (Simulated Pipeline)" : "Live Zerops Deployment"
          }`}
          backTo="/app/deployments"
          backLabel="Deployments"
          badge={
            <div className="flex items-center gap-2">
              <StatusBadge stage={deployment.stage} />
              {deployment.demoMode && (
                <span className="rounded bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                  Simulated
                </span>
              )}
            </div>
          }
          action={
            <div className="flex items-center gap-2">
              {failed && (
                <button
                  type="button"
                  onClick={() => retryMutation.mutate()}
                  disabled={retryMutation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2638] bg-[#11151f] px-3.5 py-2 text-xs font-medium text-[#f0f3f8] hover:border-indigo-500/40 hover:bg-[#161b28] transition-colors disabled:opacity-50"
                >
                  {retryMutation.isPending ? <Loader2 size={13} className="animate-spin text-indigo-400" /> : <RefreshCcw size={13} />}
                  <span>{retryMutation.isPending ? "Retrying…" : "Retry Deployment"}</span>
                </button>
              )}

              {isLive && deployment.liveUrl && (
                <a
                  href={deployment.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition-all"
                >
                  <span>Open Application</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16 space-y-8">
          {/* PIPELINE OVERVIEW CARD */}
          <section className="rounded-2xl border border-[#1e2638] bg-[#0d1017] p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#1e2638] mb-6 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Rocket size={16} className="text-indigo-400" />
                <h2 className="font-display font-semibold text-sm text-[#f0f3f8]">
                  Deployment Pipeline Rail
                </h2>
              </div>
              <span className="text-xs font-mono text-[#556075]">
                Started: {new Date(deployment.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <PipelineRail stage={deployment.stage} failedAt={deployment.failureStage} />
          </section>

          {/* ACTIVE STAGE WAITING EXPERIENCE BANNER */}
          {inProgress && (
            <section className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="h-9 w-9 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <Loader2 size={18} className="animate-spin" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-[#f0f3f8]">
                    {STAGE_EXPLANATIONS[deployment.stage]?.title || "Processing..."}
                  </h3>
                  <p className="text-xs text-[#8e98aa] mt-0.5 leading-relaxed">
                    {STAGE_EXPLANATIONS[deployment.stage]?.desc}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* LIVE VERIFIED BANNER */}
          {isLive && deployment.liveUrl && (
            <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-sm text-emerald-300">
                      Deployment Verified & Live
                    </h3>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.2 text-[10px] font-mono text-emerald-300 font-bold">
                      HEALTHY
                    </span>
                  </div>
                  <a
                    href={deployment.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-[#8e98aa] hover:text-emerald-300 transition-colors mt-1 block truncate max-w-md"
                  >
                    {deployment.liveUrl}
                  </a>
                </div>
              </div>

              <a
                href={deployment.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-all shrink-0"
              >
                <span>Launch App</span>
                <ExternalLink size={14} />
              </a>
            </section>
          )}

          {/* FAILURE & RECOVERY ANALYSIS CARD */}
          {failed && (
            <FailureRecoveryPanel
              deployment={deployment}
              diagnoseMutation={diagnoseMutation}
              retryMutation={retryMutation}
            />
          )}

          {/* 6-POINT AUTOMATED VERIFICATION RESULTS */}
          <section className="rounded-xl border border-[#1e2638] bg-[#0d1017] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1e2638]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-400" />
                <h2 className="font-display font-semibold text-sm text-[#f0f3f8]">
                  Automated Verification Suite
                </h2>
              </div>

              <button
                type="button"
                onClick={() => verifyMutation.mutate()}
                disabled={!canVerify || verifyMutation.isPending}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#1e2638] bg-[#11151f] px-3 py-1.5 text-xs font-mono text-[#8e98aa] hover:text-[#f0f3f8] hover:border-[#2a354c] transition-colors disabled:opacity-40"
              >
                {verifyMutation.isPending ? <Loader2 size={12} className="animate-spin text-indigo-400" /> : <RefreshCcw size={12} />}
                <span>{verifyMutation.isPending ? "Verifying…" : "Re-run Verification"}</span>
              </button>
            </div>

            {!deployment.verification && !canVerify && (
              <p className="text-xs text-[#556075] font-mono py-2">
                Verification probes will execute automatically once services reach health check stage.
              </p>
            )}

            {deployment.verification && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <VerifyItem label="Zerops Service Exists" ok={deployment.verification.serviceExists} />
                <VerifyItem label="Deployment Completed" ok={deployment.verification.deploymentCompleted} />
                <VerifyItem label="Container Running" ok={deployment.verification.isRunning} />
                <VerifyItem label="Health Check Passed" ok={deployment.verification.healthCheckPassed} />
                <VerifyItem label="HTTP Endpoint Reachable" ok={deployment.verification.httpReachable} />
                <VerifyItem label="Zero Critical Runtime Errors" ok={deployment.verification.noCriticalRecentErrors} />
              </div>
            )}
          </section>

          {/* DEVELOPER LOGS VIEWER */}
          <section className="space-y-3">
            <LogViewer logs={deployment.logs} maxHeight="450px" />
          </section>

          {/* REAL-TIME EVENT STREAM */}
          {deployment.events && deployment.events.length > 0 && (
            <section className="rounded-xl border border-[#1e2638] bg-[#0d1017] shadow-sm overflow-hidden font-mono text-xs">
              <div className="px-5 py-3 border-b border-[#1e2638] bg-[#11151f]/80 flex items-center justify-between">
                <div className="flex items-center gap-2 font-display font-semibold text-xs text-[#f0f3f8]">
                  <Clock size={14} className="text-indigo-400" />
                  <span>Deployment Event Timeline</span>
                </div>
                <span className="text-[11px] text-[#556075]">{deployment.events.length} events logged</span>
              </div>

              <div className="divide-y divide-[#1e2638]/40 max-h-56 overflow-y-auto p-2 scrollbar-thin">
                {deployment.events.map((e, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 text-xs hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-[#c5cddb] break-all">{e.message}</span>
                    <span className="text-[#556075] text-[11px] shrink-0 ml-4">
                      {new Date(e.ts).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </BackgroundGrid>
  );
}

function VerifyItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs font-mono transition-all",
        ok
          ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-300"
          : "border-rose-500/25 bg-rose-500/5 text-rose-300"
      )}
    >
      {ok ? (
        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
      ) : (
        <XCircle size={15} className="text-rose-400 shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </div>
  );
}

function FailureRecoveryPanel({
  deployment,
  diagnoseMutation,
  retryMutation,
}: {
  deployment: NonNullable<ReturnType<typeof useQuery<{ deployment: import("../types/domain").Deployment }>>["data"]>["deployment"];
  diagnoseMutation: ReturnType<typeof useMutation<{ diagnosis: import("../types/domain").Diagnosis; aiSource: "gemini" | "mock" }, Error, void>>;
  retryMutation: ReturnType<typeof useMutation<{ deployment: import("../types/domain").Deployment }, Error, void>>;
}) {
  const failureLabels: Record<string, string> = {
    building: "BUILD FAILURE (EXIT CODE 1)",
    deploying: "NETWORK / CONFIGURATION FAILURE",
    health_check: "HEALTH CHECK PROBE FAILURE",
  };

  const currentLabel = failureLabels[deployment.failureStage ?? ""] ?? "DEPLOYMENT RUNTIME FAILURE";

  return (
    <section className="rounded-2xl border border-rose-500/40 bg-rose-500/5 p-6 sm:p-8 shadow-xl relative overflow-hidden">
      {/* Top accent rail */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent" />

      <div className="flex items-center justify-between pb-4 border-b border-rose-500/20 mb-6 flex-wrap gap-2">
        <div className="flex items-center gap-2.5 text-rose-400 font-display font-bold text-sm sm:text-base">
          <AlertTriangle size={18} />
          <span>{currentLabel}</span>
        </div>

        {deployment.diagnosis && (
          <AiSourceBadge source={deployment.diagnosisSource || "gemini"} size="sm" />
        )}
      </div>

      {!deployment.diagnosis ? (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-[#8e98aa] leading-relaxed max-w-2xl">
            DevPilot automatically captured the failing build logs, runtime console output, and health check error traces. Submit this evidence to Gemini 2.5 Flash for root cause diagnosis and recommended repair steps.
          </p>

          <button
            type="button"
            onClick={() => diagnoseMutation.mutate()}
            disabled={diagnoseMutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:from-indigo-500 hover:to-indigo-400 transition-all disabled:opacity-50"
          >
            {diagnoseMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            <span>{diagnoseMutation.isPending ? "Analyzing Failure with Gemini…" : "Diagnose with Gemini 2.5 Flash"}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metadata bar */}
          <div className="flex items-center gap-4 text-xs font-mono text-[#8e98aa] pb-3 border-b border-[#1e2638] flex-wrap">
            <span>Confidence: <strong className="text-white capitalize">{deployment.diagnosis.confidence}</strong></span>
            <span>·</span>
            <span>Severity: <strong className="text-rose-400 uppercase">{deployment.diagnosis.severity}</strong></span>
            <span>·</span>
            <span>Category: <strong className="text-indigo-300">{deployment.diagnosis.category.replace(/_/g, " ")}</strong></span>
          </div>

          {/* Analysis Blocks */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#1e2638] bg-[#0d1017] p-4">
              <span className="text-[11px] font-mono text-[#556075] uppercase block mb-1">
                Failure Summary
              </span>
              <p className="text-xs sm:text-sm text-[#f0f3f8] leading-relaxed font-sans">
                {deployment.diagnosis.summary}
              </p>
            </div>

            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
              <span className="text-[11px] font-mono text-rose-400 uppercase block mb-1">
                Root Cause
              </span>
              <p className="text-xs sm:text-sm text-[#f0f3f8] leading-relaxed font-sans">
                {deployment.diagnosis.rootCause}
              </p>
            </div>
          </div>

          {/* Recommended Fix */}
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5">
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-300 font-semibold mb-2">
              <Wrench size={14} />
              <span>Recommended Fix</span>
            </div>
            <p className="text-xs sm:text-sm text-[#e2e8f0] leading-relaxed font-sans whitespace-pre-wrap">
              {deployment.diagnosis.recommendedFix}
            </p>
          </div>

          {/* Safe review actions */}
          {deployment.diagnosis.safeActions && deployment.diagnosis.safeActions.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono text-[#8e98aa] uppercase tracking-wider block">
                Suggested Review Steps
              </span>
              <div className="space-y-2">
                {deployment.diagnosis.safeActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-start gap-3 rounded-lg border border-[#1e2638] bg-[#0d1017] p-3 text-xs"
                  >
                    <div className="h-5 w-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <div className="font-semibold text-[#f0f3f8] mb-0.5">{action.label}</div>
                      <div className="text-[#8e98aa] leading-relaxed">{action.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer & Retry Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-rose-500/20">
            <p className="text-[11px] text-[#8e98aa] italic font-sans max-w-lg">
              DevPilot presents AI-guided recommendations for human review and will never execute destructive shell commands automatically.
            </p>

            <button
              type="button"
              onClick={() => retryMutation.mutate()}
              disabled={retryMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:from-indigo-500 hover:to-indigo-400 transition-all shrink-0 disabled:opacity-50"
            >
              {retryMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
              <span>{retryMutation.isPending ? "Retrying…" : "Retry Deployment"}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default DeploymentPage;
