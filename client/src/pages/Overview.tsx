import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Clock,
  Plus,
  Rocket,
  Sparkles,
} from "lucide-react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { PageHeader } from "../components/PageHeader";
import { BackgroundGrid } from "../components/BackgroundGrid";
import { EmptyState } from "../components/EmptyState";

export function Overview() {
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: api.listProjects,
    refetchInterval: 4000,
  });

  const deploymentsQuery = useQuery({
    queryKey: ["deployments"],
    queryFn: api.listDeployments,
    refetchInterval: 4000,
  });

  const deployments = deploymentsQuery.data?.deployments ?? [];
  const projects = projectsQuery.data?.projects ?? [];
  const liveCount = deployments.filter((d) => d.stage === "live").length;
  const successRate = deployments.length ? Math.round((liveCount / deployments.length) * 100) : 100;
  const activeServices = deployments
    .filter((d) => d.stage === "live")
    .reduce((sum, d) => sum + (d.architecture?.services?.length ?? 0), 0);

  return (
    <BackgroundGrid variant="subtle">
      <div>
        <PageHeader
          title="Overview"
          subtitle="Your DevPilot projects, infrastructure state, and deployment health."
          action={
            <Link
              to="/app/new"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_16px_rgba(99,102,241,0.25)] hover:from-indigo-500 hover:to-indigo-400 transition-all hover:-translate-y-0.5"
            >
              <Plus size={15} />
              <span>New Deployment</span>
            </Link>
          }
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12 space-y-8">
          {/* STATS GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Boxes}
              label="Projects"
              value={projects.length}
              detail="Active Zerops environments"
            />
            <StatCard
              icon={Rocket}
              label="Deployments"
              value={deployments.length}
              detail="Total pipeline runs"
            />
            <StatCard
              icon={CheckCircle2}
              label="Success Rate"
              value={`${successRate}%`}
              detail={`${liveCount} live services`}
              accent="emerald"
            />
            <StatCard
              icon={Activity}
              label="Active Services"
              value={activeServices}
              detail="Containers running"
              accent="sky"
            />
          </div>

          {/* RECENT DEPLOYMENTS TABLE */}
          <div className="rounded-xl border border-[#1e2638] bg-[#0d1017] shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2638] bg-[#11151f]/80">
              <div className="flex items-center gap-2">
                <Rocket size={16} className="text-indigo-400" />
                <h2 className="font-display font-semibold text-sm text-[#f0f3f8]">
                  Recent Deployments
                </h2>
              </div>
              {deployments.length > 0 && (
                <Link
                  to="/app/deployments"
                  className="text-xs font-mono text-[#8e98aa] hover:text-[#f0f3f8] flex items-center gap-1 transition-colors"
                >
                  <span>View all ({deployments.length})</span>
                  <ArrowUpRight size={13} />
                </Link>
              )}
            </div>

            {deployments.length === 0 ? (
              <EmptyState
                icon={Rocket}
                title="No deployments found"
                description="Start your first deployment by describing your application in plain English."
                actionText="Create Deployment"
                actionTo="/app/new"
                className="border-none bg-transparent"
              />
            ) : (
              <div className="divide-y divide-[#1e2638]/60 font-mono text-xs">
                {deployments.slice(0, 8).map((d) => (
                  <Link
                    key={d.id}
                    to={`/app/deployments/${d.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Left: Project & Services */}
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-[#f0f3f8] group-hover:text-indigo-300 transition-colors">
                          {d.projectName}
                        </span>
                        {d.demoMode && (
                          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-400">
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#8e98aa] mt-1 flex items-center gap-1.5 flex-wrap truncate font-sans">
                        <span>ID: {d.id}</span>
                        <span>·</span>
                        <span>
                          {d.architecture?.services?.map((s) => s.technology).join(", ") ||
                            "Zerops services"}
                        </span>
                      </div>
                    </div>

                    {/* Right: Timestamp & Status */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex items-center gap-1 text-[#556075] text-[11px]">
                        <Clock size={11} />
                        <span>{new Date(d.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <StatusBadge stage={d.stage} size="sm" />
                      <ArrowRight
                        size={14}
                        className="text-[#556075] group-hover:text-[#f0f3f8] group-hover:translate-x-0.5 transition-all hidden sm:block"
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* QUICK TEMPLATES / STARTER PROMPTS */}
          <div className="rounded-xl border border-[#1e2638] bg-[#0d1017]/60 p-6">
            <div className="flex items-center gap-2 mb-3 font-display font-medium text-xs text-[#8e98aa] uppercase tracking-wider">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Quick Deployment Blueprints</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 font-mono text-xs">
              <QuickPromptCard
                title="Full-Stack React + Node + Postgres"
                desc="React SPA frontend, Node.js API, and managed PostgreSQL."
                prompt="A React frontend with a Node.js API and PostgreSQL database."
              />
              <QuickPromptCard
                title="Python FastAPI + Postgres"
                desc="FastAPI async backend service connected to PostgreSQL."
                prompt="A Python FastAPI backend with a PostgreSQL database, no frontend."
              />
              <QuickPromptCard
                title="Static Site + API + Valkey Cache"
                desc="Static frontend, Express API backend, and Valkey memory cache."
                prompt="A static marketing site with a Node.js API and Valkey for session caching."
              />
            </div>
          </div>
        </div>
      </div>
    </BackgroundGrid>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  accent = "indigo",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string | number;
  detail: string;
  accent?: "indigo" | "emerald" | "sky";
}) {
  const accentColors = {
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  };

  return (
    <div className="rounded-xl border border-[#1e2638] bg-[#0d1017] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono text-[#8e98aa]">{label}</span>
        <div
          className={`h-7 w-7 rounded-lg flex items-center justify-center border ${accentColors[accent]}`}
        >
          <Icon size={14} />
        </div>
      </div>
      <div className="font-display text-2xl font-bold text-[#f0f3f8]">{value}</div>
      <div className="text-[11px] font-mono text-[#556075] mt-1">{detail}</div>
    </div>
  );
}

function QuickPromptCard({
  title,
  desc,
  prompt,
}: {
  title: string;
  desc: string;
  prompt: string;
}) {
  return (
    <Link
      to={`/app/new?q=${encodeURIComponent(prompt)}`}
      className="rounded-lg border border-[#1e2638] bg-[#11151f] p-3.5 hover:border-indigo-500/40 hover:bg-[#161b28] transition-all group"
    >
      <div className="font-sans font-semibold text-xs text-[#f0f3f8] group-hover:text-indigo-300 transition-colors mb-1">
        {title}
      </div>
      <p className="font-sans text-[11px] text-[#8e98aa] leading-relaxed line-clamp-2">
        {desc}
      </p>
    </Link>
  );
}

export default Overview;
