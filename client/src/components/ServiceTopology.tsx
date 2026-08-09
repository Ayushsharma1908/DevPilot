import type { Architecture, ServiceRole } from "../types/domain";
import {
  Boxes,
  Database,
  Globe,
  Layers,
  Server,
  Zap,
  ArrowDown,
  Info,
} from "lucide-react";
import clsx from "clsx";

const ROLE_ORDER: Record<ServiceRole, number> = {
  frontend: 0,
  backend: 1,
  cache: 2,
  database: 3,
};

const ROLE_ICON: Record<ServiceRole, React.ComponentType<{ size?: number; className?: string }>> = {
  frontend: Layers,
  backend: Server,
  database: Database,
  cache: Zap,
};

const ROLE_COLOR_CONFIG: Record<
  ServiceRole,
  {
    text: string;
    border: string;
    bg: string;
    badgeBg: string;
    tagBorder: string;
  }
> = {
  frontend: {
    text: "text-sky-400",
    border: "border-sky-500/30 hover:border-sky-500/60",
    bg: "bg-sky-500/5",
    badgeBg: "bg-sky-500/10 text-sky-300",
    tagBorder: "border-sky-500/20",
  },
  backend: {
    text: "text-indigo-400",
    border: "border-indigo-500/30 hover:border-indigo-500/60",
    bg: "bg-indigo-500/5",
    badgeBg: "bg-indigo-500/10 text-indigo-300",
    tagBorder: "border-indigo-500/20",
  },
  database: {
    text: "text-emerald-400",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    bg: "bg-emerald-500/5",
    badgeBg: "bg-emerald-500/10 text-emerald-300",
    tagBorder: "border-emerald-500/20",
  },
  cache: {
    text: "text-amber-400",
    border: "border-amber-500/30 hover:border-amber-500/60",
    bg: "bg-amber-500/5",
    badgeBg: "bg-amber-500/10 text-amber-300",
    tagBorder: "border-amber-500/20",
  },
};

export function ServiceTopology({ architecture }: { architecture: Architecture }) {
  const ordered = [...architecture.services].sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role]);

  return (
    <div className="flex flex-col items-center py-6 px-4 w-full max-w-2xl mx-auto">
      {/* Client Ingress Node */}
      <div className="flex items-center gap-3 rounded-lg border border-[#1e2638] bg-[#0d1017] px-4 py-2 text-xs font-mono text-[#8e98aa]">
        <Globe size={14} className="text-indigo-400" />
        <span>Client Ingress / Public Traffic</span>
      </div>

      <FlowConnector />

      {/* Services List */}
      <div className="w-full space-y-0">
        {ordered.map((svc, i) => (
          <div key={svc.name} className="flex flex-col items-center w-full">
            <ServiceCard service={svc} />
            {i < ordered.length - 1 && <FlowConnector />}
          </div>
        ))}
      </div>

      {/* Unsupported features alert */}
      {architecture.unsupported && architecture.unsupported.length > 0 && (
        <div className="mt-8 w-full rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
          <div className="flex items-center gap-2 font-medium text-amber-400 mb-2">
            <Boxes size={15} />
            <span>Not included in initial Zerops architecture</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[#8e98aa]">
            {architecture.unsupported.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function FlowConnector() {
  return (
    <div className="flex flex-col items-center my-1">
      <div className="w-px h-6 bg-gradient-to-b from-[#1e2638] via-[#2a354c] to-[#1e2638]" />
      <ArrowDown size={12} className="text-[#556075] -mt-1" />
    </div>
  );
}

function ServiceCard({ service }: { service: Architecture["services"][0] }) {
  const config = ROLE_COLOR_CONFIG[service.role] || ROLE_COLOR_CONFIG.backend;
  const Icon = ROLE_ICON[service.role] || Server;

  return (
    <div
      className={clsx(
        "w-full rounded-xl border bg-[#11151f] p-4 transition-all duration-200 shadow-sm relative group",
        config.border
      )}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Icon & Service Meta */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div
            className={clsx(
              "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border",
              config.bg,
              config.tagBorder,
              config.text
            )}
          >
            <Icon size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-semibold text-sm text-[#f0f3f8]">
                {service.name}
              </span>
              <span
                className={clsx(
                  "rounded px-2 py-0.5 text-[10px] font-mono font-medium uppercase tracking-wider",
                  config.badgeBg
                )}
              >
                {service.role}
              </span>
              {service.port && (
                <span className="rounded border border-[#1e2638] bg-[#0d1017] px-1.5 py-0.5 text-[10px] font-mono text-[#8e98aa]">
                  :{service.port}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-[#8e98aa] font-mono">
              <span>{service.technology}</span>
              <span>·</span>
              <span className="text-indigo-300/80">zerops: {service.zeropsType}</span>
            </div>
          </div>
        </div>

        {/* Right: Dependencies */}
        {service.dependsOn && service.dependsOn.length > 0 && (
          <div className="hidden sm:flex flex-col items-end shrink-0">
            <span className="text-[10px] font-mono text-[#556075] uppercase">Depends on</span>
            <div className="flex items-center gap-1 mt-1">
              {service.dependsOn.map((dep) => (
                <span
                  key={dep}
                  className="rounded border border-[#1e2638] bg-[#0d1017] px-1.5 py-0.5 text-[10px] font-mono text-[#8e98aa]"
                >
                  {dep}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rationale explanation */}
      {service.reason && (
        <div className="mt-3 pt-3 border-t border-[#1e2638]/60 flex items-start gap-2 text-xs text-[#8e98aa]">
          <Info size={13} className="text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{service.reason}</p>
        </div>
      )}
    </div>
  );
}

export default ServiceTopology;
