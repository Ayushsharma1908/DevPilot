import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  Plus,
  Rocket,
  Search,
} from "lucide-react";
import { api } from "../api/client";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { BackgroundGrid } from "../components/BackgroundGrid";
import { EmptyState } from "../components/EmptyState";

export function DeploymentsList() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const deploymentsQuery = useQuery({
    queryKey: ["deployments"],
    queryFn: api.listDeployments,
    refetchInterval: 3000,
  });

  const deployments = deploymentsQuery.data?.deployments ?? [];

  const filtered = useMemo(() => {
    return deployments.filter((d) => {
      if (stageFilter !== "all" && d.stage !== stageFilter) return false;
      if (
        search &&
        !d.projectName.toLowerCase().includes(search.toLowerCase()) &&
        !d.id.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [deployments, stageFilter, search]);

  return (
    <BackgroundGrid variant="subtle">
      <div>
        <PageHeader
          title="Deployments & Activity"
          subtitle="Complete audit trail of all infrastructure deployments and pipeline executions."
          backTo="/app"
          backLabel="Overview"
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

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-16 space-y-6">
          {/* FILTER CONTROLS */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
              <div className="relative w-full">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#556075]"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by project name or ID..."
                  className="w-full rounded-xl border border-[#1e2638] bg-[#0d1017] pl-9 pr-3 py-2 text-xs text-[#f0f3f8] placeholder-[#556075] outline-none focus:border-indigo-500/60 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="rounded-xl border border-[#1e2638] bg-[#0d1017] px-3 py-2 text-xs text-[#8e98aa] outline-none focus:border-indigo-500/60"
              >
                <option value="all">Status: All</option>
                <option value="live">Live only</option>
                <option value="failed">Failed only</option>
                <option value="building">Building / Active</option>
              </select>
            </div>
          </div>

          {/* DEPLOYMENTS LIST CARD */}
          <div className="rounded-xl border border-[#1e2638] bg-[#0d1017] shadow-xl overflow-hidden">
            {deployments.length === 0 ? (
              <EmptyState
                icon={Rocket}
                title="No Deployments Recorded"
                description="DevPilot has not executed any deployments in this session yet."
                actionText="Start First Deployment"
                actionTo="/app/new"
                className="border-none bg-transparent py-16"
              />
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-xs font-mono text-[#556075]">
                No deployments match the filter criteria.
              </div>
            ) : (
              <div className="divide-y divide-[#1e2638]/60 font-mono text-xs">
                {filtered.map((d) => (
                  <Link
                    key={d.id}
                    to={`/app/deployments/${d.id}`}
                    className="flex items-center justify-between p-4 sm:px-6 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="min-w-0 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-[#f0f3f8] text-sm group-hover:text-indigo-300 transition-colors">
                          {d.projectName}
                        </span>
                        {d.demoMode && (
                          <span className="rounded bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 text-[10px] text-amber-300">
                            Demo
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-[#8e98aa] mt-1 flex items-center gap-2 flex-wrap font-sans">
                        <span className="font-mono text-[#556075]">ID: {d.id}</span>
                        <span>·</span>
                        <span>
                          {d.architecture?.services?.map((s) => s.name).join(", ") ||
                            "Zerops services"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex items-center gap-1 text-[#556075] text-[11px]">
                        <Clock size={12} />
                        <span>{new Date(d.createdAt).toLocaleString()}</span>
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
        </div>
      </div>
    </BackgroundGrid>
  );
}

export default DeploymentsList;
