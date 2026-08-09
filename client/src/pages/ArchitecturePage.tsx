import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { ServiceTopology } from "../components/ServiceTopology";
import { AiSourceBadge } from "../components/AiSourceBadge";
import { BackgroundGrid } from "../components/BackgroundGrid";
import { EmptyState } from "../components/EmptyState";
import { useFlow } from "../lib/FlowContext";

export function ArchitecturePage() {
  const flow = useFlow();
  const navigate = useNavigate();

  if (!flow.architecture) {
    return (
      <BackgroundGrid variant="architecture">
        <div>
          <PageHeader title="Architecture" backTo="/app/new" backLabel="New Deployment" />
          <div className="max-w-xl mx-auto px-6 py-12">
            <EmptyState
              title="No Architecture Blueprint Found"
              description="Describe an application to let DevPilot's AI engine generate and validate a Zerops architecture."
              actionText="Create Architecture"
              actionTo="/app/new"
            />
          </div>
        </div>
      </BackgroundGrid>
    );
  }

  const isValid = flow.validation ? flow.validation.valid : true;
  const issueCount = flow.validation ? flow.validation.issues.length : 0;

  return (
    <BackgroundGrid variant="architecture">
      <div>
        <PageHeader
          title={flow.architecture.projectName || "Architecture Blueprint"}
          subtitle={`Verified Zerops service topology (${flow.architecture.services.length} services)`}
          backTo="/app/new"
          backLabel="Edit Description"
          badge={<AiSourceBadge source={flow.aiSource} size="sm" />}
          action={
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/app/new")}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#1e2638] bg-[#11151f] px-3.5 py-2 text-xs font-medium text-[#8e98aa] hover:border-[#2a354c] hover:text-[#f0f3f8] transition-colors"
              >
                <ArrowLeft size={13} />
                <span>Edit Prompt</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/app/configuration")}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(99,102,241,0.3)] hover:from-indigo-500 hover:to-indigo-400 transition-all hover:-translate-y-0.5"
              >
                <span>Generate Configuration</span>
                <ArrowRight size={14} />
              </button>
            </div>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16">
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
            {/* TOPOLOGY DIAGRAM COLUMN */}
            <div className="rounded-2xl border border-[#1e2638] bg-[#0d1017] p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#1e2638] mb-4">
                <div className="flex items-center gap-2 font-display font-semibold text-sm text-[#f0f3f8]">
                  <span>Service Topology Map</span>
                </div>
                <span className="text-xs font-mono text-[#556075]">
                  {flow.architecture.services.length} Microservices & Data Stores
                </span>
              </div>

              <ServiceTopology architecture={flow.architecture} />
            </div>

            {/* SIDEBAR DETAILS COLUMN */}
            <div className="space-y-5">
              {/* Architecture Summary */}
              <div className="rounded-xl border border-[#1e2638] bg-[#0d1017] p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1e2638]/60">
                  <span className="font-display font-medium text-xs text-[#8e98aa] uppercase tracking-wider">
                    Executive Summary
                  </span>
                  <AiSourceBadge source={flow.aiSource} size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-[#c5cddb] leading-relaxed">
                  {flow.architecture.summary}
                </p>
              </div>

              {/* Validation Status Card */}
              {flow.validation && (
                <div
                  className={`rounded-xl border p-5 shadow-sm transition-all ${
                    isValid
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-rose-500/30 bg-rose-500/5"
                  }`}
                >
                  <div className="flex items-center gap-2 font-display font-semibold text-xs mb-2">
                    {isValid ? (
                      <>
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-emerald-300">Deterministic Validation Passed</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} className="text-rose-400" />
                        <span className="text-rose-300">
                          {issueCount} Validation Issue{issueCount > 1 ? "s" : ""}
                        </span>
                      </>
                    )}
                  </div>

                  {isValid ? (
                    <p className="text-xs text-[#8e98aa] leading-relaxed">
                      All container types, service names, ports, and cross-service dependencies strictly comply with Zerops platform standards.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 font-mono text-xs text-rose-300">
                      {flow.validation.issues.map((issue, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">•</span>
                          <span>
                            <strong className="text-rose-200">{issue.field}:</strong> {issue.message}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Services Breakdown List */}
              <div className="rounded-xl border border-[#1e2638] bg-[#0d1017] p-5 shadow-sm">
                <div className="font-display font-medium text-xs text-[#8e98aa] uppercase tracking-wider mb-3">
                  Provisioned Stack Specs
                </div>
                <div className="space-y-2.5 font-mono text-xs">
                  {flow.architecture.services.map((svc) => (
                    <div
                      key={svc.name}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#1e2638] bg-[#11151f]"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-[#f0f3f8] truncate">{svc.name}</div>
                        <div className="text-[11px] text-[#8e98aa] truncate">{svc.technology}</div>
                      </div>
                      <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] text-indigo-300 shrink-0">
                        {svc.zeropsType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Step Action */}
              <button
                type="button"
                onClick={() => navigate("/app/configuration")}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 py-3 text-xs font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:from-indigo-500 hover:to-indigo-400 transition-all hover:-translate-y-0.5"
              >
                <Settings size={14} />
                <span>Generate Zerops Configurations</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </BackgroundGrid>
  );
}

export default ArchitecturePage;
