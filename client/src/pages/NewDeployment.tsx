import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, ArrowRight, Cpu } from "lucide-react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { useFlow } from "../lib/FlowContext";
import { BackgroundGrid } from "../components/BackgroundGrid";
import { LoadingSteps } from "../components/LoadingSteps";

const EXAMPLES = [
  "A React frontend with a Node.js API and PostgreSQL database.",
  "A Python FastAPI backend with a PostgreSQL database, no frontend.",
  "A static marketing site with a Node.js API and Valkey for session caching.",
  "A Next.js full-stack application with a PostgreSQL database and background worker.",
];

const ANALYSIS_STEPS = [
  "Parsing application requirements & dependencies",
  "Designing Zerops service topology (frontend, backend, db)",
  "Checking Zerops container types & port definitions",
  "Validating network connectivity & environment variables",
  "Finalizing verified architecture blueprint",
];

export function NewDeployment() {
  const flow = useFlow();
  const [searchParams] = useSearchParams();
  const queryPrompt = searchParams.get("q");

  const [value, setValue] = useState(queryPrompt || flow.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (queryPrompt && !value) {
      setValue(queryPrompt);
    }
  }, [queryPrompt, value]);

  async function handleAnalyze() {
    const trimmed = value.trim();
    if (trimmed.length < 5) {
      setError("Please provide a short description of what you want to deploy (e.g. React frontend with Node.js backend).");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { architecture, aiSource, validation } = await api.analyzeArchitecture(trimmed);
      flow.setDescription(trimmed);
      flow.setArchitecture(architecture, aiSource, validation);
      navigate("/app/architecture");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong analyzing your description.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleAnalyze();
    }
  }

  return (
    <BackgroundGrid variant="architecture">
      <div>
        <PageHeader
          title="New Deployment"
          subtitle="Describe your application stack in plain English. DevPilot will architect it for Zerops."
          backTo="/app"
          backLabel="Overview"
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-8 pb-16">
          {loading ? (
            <div className="max-w-2xl mx-auto py-8">
              <LoadingSteps
                title="Architecting Zerops Infrastructure"
                steps={ANALYSIS_STEPS}
                durationPerStep={800}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Input Card */}
              <div className="rounded-2xl border border-[#1e2638] bg-[#0d1017] p-6 sm:p-8 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <label
                    htmlFor="app-description"
                    className="flex items-center gap-2 font-display font-semibold text-sm sm:text-base text-[#f0f3f8]"
                  >
                    <Sparkles size={16} className="text-indigo-400" />
                    <span>What application do you want to deploy?</span>
                  </label>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-[#556075]">
                    Press <kbd className="rounded border border-[#1e2638] bg-[#11151f] px-1.5 py-0.5 text-[10px] text-[#8e98aa]">Ctrl</kbd> + <kbd className="rounded border border-[#1e2638] bg-[#11151f] px-1.5 py-0.5 text-[10px] text-[#8e98aa]">Enter</kbd>
                  </span>
                </div>

                <textarea
                  id="app-description"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={5}
                  placeholder="e.g. I want to deploy a React single-page frontend with a Node.js Express API and a PostgreSQL database."
                  className="w-full rounded-xl border border-[#1e2638] bg-[#11151f] p-4 text-[14px] leading-relaxed text-[#f0f3f8] placeholder-[#556075] outline-none transition-all focus:border-indigo-500/80 focus:bg-[#141924] shadow-inner font-sans resize-none"
                />

                {error && (
                  <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-300 font-mono">
                    {error}
                  </div>
                )}

                {/* Example Pills */}
                <div className="mt-5 space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#556075] block">
                    Example blueprints
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setValue(ex)}
                        className="rounded-lg border border-[#1e2638] bg-[#11151f]/80 px-3 py-1.5 text-xs text-[#8e98aa] hover:border-indigo-500/40 hover:bg-[#161b28] hover:text-[#f0f3f8] transition-all text-left font-sans"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="mt-8 flex items-center justify-between pt-6 border-t border-[#1e2638] flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#556075]">
                    <Cpu size={14} className="text-indigo-400" />
                    <span>Gemini 2.5 Flash + Deterministic Validator</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading || value.trim().length === 0}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:from-indigo-500 hover:to-indigo-400 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <Sparkles size={16} />
                    <span>Analyze Architecture</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Information Strip */}
              <div className="grid sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="rounded-xl border border-[#1e2638] bg-[#0d1017]/40 p-4">
                  <span className="text-indigo-400 font-bold block mb-1">1. Topology</span>
                  <p className="text-[#8e98aa] text-[11px] font-sans">
                    Detects microservices, databases, caches, and networking.
                  </p>
                </div>
                <div className="rounded-xl border border-[#1e2638] bg-[#0d1017]/40 p-4">
                  <span className="text-sky-400 font-bold block mb-1">2. Two-Tier YAML</span>
                  <p className="text-[#8e98aa] text-[11px] font-sans">
                    Generates clean import.yaml for infra and zerops.yaml for builds.
                  </p>
                </div>
                <div className="rounded-xl border border-[#1e2638] bg-[#0d1017]/40 p-4">
                  <span className="text-emerald-400 font-bold block mb-1">3. Verification</span>
                  <p className="text-[#8e98aa] text-[11px] font-sans">
                    Runs health checks & HTTP tests to verify before going live.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </BackgroundGrid>
  );
}

export default NewDeployment;
