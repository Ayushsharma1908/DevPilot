import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Loader2,
  Rocket,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { CodeBlock } from "../components/CodeBlock";
import { BackgroundGrid } from "../components/BackgroundGrid";
import { LoadingSteps } from "../components/LoadingSteps";
import { EmptyState } from "../components/EmptyState";
import { useFlow } from "../lib/FlowContext";
import type { SimulatedFailure, ValidationResult } from "../types/domain";
import clsx from "clsx";

const CONFIG_STEPS = [
  "Structuring Zerops project & service models",
  "Generating infrastructure definition (import.yaml)",
  "Configuring build pipelines & runtime commands (zerops.yaml)",
  "Setting up environment variables & cross-service links",
  "Validating YAML syntax & health check endpoints",
];

const FAILURE_OPTIONS: { value: SimulatedFailure; label: string; desc: string }[] = [
  {
    value: "none",
    label: "Happy Path (Standard Deployment)",
    desc: "All services build, start, and pass automated health checks.",
  },
  {
    value: "missing_dependency",
    label: "Simulate: Build Failure (Missing Package)",
    desc: "Build stage fails with exit code 1 to test build log analysis.",
  },
  {
    value: "health_check_failure",
    label: "Simulate: Health Check Timeout (Port 3000)",
    desc: "Service starts but health check endpoint times out after 15s.",
  },
  {
    value: "db_connection_failure",
    label: "Simulate: Runtime DB Connection Refused",
    desc: "Service crashes on boot due to database handshake rejection.",
  },
];

export function ConfigurationPage() {
  const flow = useFlow();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"import" | "zerops">("import");
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [simulateFailure, setSimulateFailure] = useState<SimulatedFailure>("none");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!flow.architecture || flow.zeropsYaml) return;
    setLoadingConfig(true);
    api
      .generateConfig(flow.architecture)
      .then(({ importYaml, zeropsYaml }) => flow.setConfig(importYaml, zeropsYaml))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to generate configuration."))
      .finally(() => setLoadingConfig(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flow.architecture]);

  async function handleValidate() {
    if (!flow.architecture) return;
    setValidating(true);
    setError(null);
    try {
      const { validation } = await api.validateArchitecture(flow.architecture);
      setValidation(validation);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Validation check failed.");
    } finally {
      setValidating(false);
    }
  }

  async function handleDeploy() {
    if (!flow.architecture) return;
    setDeploying(true);
    setError(null);
    try {
      const { deployment } = await api.createDeployment(flow.architecture, simulateFailure);
      navigate(`/app/deployments/${deployment.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to trigger deployment.");
    } finally {
      setDeploying(false);
    }
  }

  if (!flow.architecture) {
    return (
      <BackgroundGrid variant="config">
        <div>
          <PageHeader title="Configuration" backTo="/app/new" backLabel="New Deployment" />
          <div className="max-w-xl mx-auto px-6 py-12">
            <EmptyState
              title="No Architecture Active"
              description="Please start a deployment first so DevPilot can generate the appropriate Zerops configuration."
              actionText="New Deployment"
              actionTo="/app/new"
            />
          </div>
        </div>
      </BackgroundGrid>
    );
  }

  return (
    <BackgroundGrid variant="config">
      <div>
        <PageHeader
          title="Configuration"
          subtitle={`Generated two-tier Zerops configuration for ${flow.architecture.projectName}`}
          backTo="/app/architecture"
          backLabel="Architecture"
          action={
            <button
              type="button"
              onClick={handleDeploy}
              disabled={deploying || loadingConfig}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:from-indigo-500 hover:to-indigo-400 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deploying ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
              <span>{deploying ? "Initiating Deployment…" : "Deploy to Zerops"}</span>
            </button>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
          {loadingConfig ? (
            <div className="max-w-2xl mx-auto py-8">
              <LoadingSteps
                title="Generating Zerops Configuration YAMLs"
                steps={CONFIG_STEPS}
                durationPerStep={750}
              />
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
              {/* YAML CODE EDITOR COLUMN */}
              <div className="space-y-4">
                {/* Visual YAML Type Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTab("import")}
                    className={clsx(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      tab === "import"
                        ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_16px_rgba(99,102,241,0.15)]"
                        : "border-[#1e2638] bg-[#0d1017] hover:border-[#2a354c] opacity-75 hover:opacity-100"
                    )}
                  >
                    <div
                      className={clsx(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                        tab === "import"
                          ? "border-indigo-500/40 bg-indigo-500/20 text-indigo-300"
                          : "border-[#1e2638] bg-[#11151f] text-[#8e98aa]"
                      )}
                    >
                      <Boxes size={16} />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-xs text-[#f0f3f8] flex items-center gap-1.5">
                        <span>Infrastructure Definition</span>
                      </div>
                      <span className="font-mono text-[11px] text-indigo-400 font-medium">import.yaml</span>
                      <p className="text-[11px] text-[#8e98aa] mt-1 leading-snug">
                        Creates projects, services, ports, and environment links.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab("zerops")}
                    className={clsx(
                      "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                      tab === "zerops"
                        ? "border-sky-500 bg-sky-500/10 shadow-[0_0_16px_rgba(14,165,233,0.15)]"
                        : "border-[#1e2638] bg-[#0d1017] hover:border-[#2a354c] opacity-75 hover:opacity-100"
                    )}
                  >
                    <div
                      className={clsx(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border",
                        tab === "zerops"
                          ? "border-sky-500/40 bg-sky-500/20 text-sky-300"
                          : "border-[#1e2638] bg-[#11151f] text-[#8e98aa]"
                      )}
                    >
                      <Terminal size={16} />
                    </div>
                    <div>
                      <div className="font-display font-semibold text-xs text-[#f0f3f8] flex items-center gap-1.5">
                        <span>Build & Runtime Pipeline</span>
                      </div>
                      <span className="font-mono text-[11px] text-sky-400 font-medium">zerops.yaml</span>
                      <p className="text-[11px] text-[#8e98aa] mt-1 leading-snug">
                        Controls build steps, run commands, and health checks.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Code Block Container */}
                <CodeBlock
                  code={tab === "import" ? flow.importYaml : flow.zeropsYaml}
                  filename={tab === "import" ? "import.yaml" : "zerops.yaml"}
                  language="yaml"
                  maxHeight="540px"
                />
              </div>

              {/* CONTROLS & VALIDATION COLUMN */}
              <div className="space-y-5">
                {/* Validation Card */}
                <div className="rounded-xl border border-[#1e2638] bg-[#0d1017] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e2638]/60">
                    <span className="font-display font-medium text-xs text-[#8e98aa] uppercase tracking-wider">
                      Validation Check
                    </span>
                    <ShieldCheck size={14} className="text-indigo-400" />
                  </div>

                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={validating}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-[#1e2638] bg-[#11151f] px-4 py-2.5 text-xs font-medium text-[#f0f3f8] hover:border-indigo-500/40 hover:bg-[#161b28] transition-all disabled:opacity-50"
                  >
                    {validating ? (
                      <Loader2 size={14} className="animate-spin text-indigo-400" />
                    ) : (
                      <ShieldCheck size={14} className="text-emerald-400" />
                    )}
                    <span>{validating ? "Validating Configuration…" : "Run Validation Suite"}</span>
                  </button>

                  {validation && (
                    <div
                      className={clsx(
                        "mt-3 rounded-lg border p-3 text-xs font-mono transition-all",
                        validation.valid
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                      )}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        {validation.valid ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        <span>{validation.valid ? "Configuration Verified" : "Issues Detected"}</span>
                      </div>
                      <p className="text-[11px] font-sans text-[#8e98aa]">
                        {validation.valid
                          ? "All services and pipelines pass Zerops syntax rules."
                          : `${validation.issues.length} validation issue(s) require review.`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Demo Failure Injection Controls */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-amber-400 font-display font-semibold text-xs mb-2">
                    <AlertTriangle size={15} />
                    <span>Demo Controls · Recovery Flow</span>
                  </div>

                  <p className="text-xs text-[#8e98aa] leading-relaxed mb-3">
                    Inject a simulated failure to evaluate DevPilot's evidence collection, Gemini 2.5 Flash diagnosis, and guided recovery workflow.
                  </p>

                  <select
                    value={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.value as SimulatedFailure)}
                    className="w-full rounded-lg border border-[#1e2638] bg-[#080a0f] p-2.5 text-xs text-[#f0f3f8] font-mono outline-none focus:border-amber-500/60"
                  >
                    {FAILURE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <div className="mt-2.5 rounded border border-[#1e2638] bg-[#080a0f]/60 p-2.5 text-[11px] text-[#8e98aa] font-mono">
                    {FAILURE_OPTIONS.find((f) => f.value === simulateFailure)?.desc}
                  </div>
                </div>

                {/* Global Error Banner */}
                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-mono text-rose-300">
                    {error}
                  </div>
                )}

                {/* Primary Deploy Button */}
                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3.5 text-xs font-semibold text-white shadow-[0_0_24px_rgba(99,102,241,0.35)] hover:from-indigo-500 hover:to-indigo-400 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deploying ? <Loader2 size={16} className="animate-spin" /> : <Rocket size={16} />}
                  <span>{deploying ? "Starting Zerops Pipeline…" : "Deploy to Zerops"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BackgroundGrid>
  );
}

export default ConfigurationPage;
