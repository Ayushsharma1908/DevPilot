import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  Activity,
  LayoutGrid,
  Plus,
  Rocket,
  Menu,
  X,
  ExternalLink,
  Cpu,
  Sparkles,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { DevPilotLogo } from "./DevPilotLogo";
import clsx from "clsx";

const NAV_ITEMS = [
  { to: "/app", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/app/new", label: "New Deployment", icon: Plus, end: false },
  { to: "/app/deployments", label: "Deployments", icon: Rocket, end: false },
  { to: "/app/activity", label: "Activity", icon: Activity, end: false },
];

export function AppShell() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 30000,
  });

  const health = healthQuery.data;

  return (
    <div className="flex min-h-screen bg-[#080a0f] text-[#f0f3f8] flex-col md:flex-row">
      {/* Mobile Top Navigation Bar */}
      <header className="md:hidden flex items-center justify-between px-4 h-14 border-b border-[#1e2638] bg-[#0d1017]/90 backdrop-blur sticky top-0 z-30">
        <Link to="/app">
          <DevPilotLogo size="sm" />
        </Link>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-[#8e98aa] hover:text-[#f0f3f8] hover:bg-white/5"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-14 bg-[#080a0f]/95 backdrop-blur-md z-20 p-4 border-b border-[#1e2638] flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30"
                    : "text-[#8e98aa] hover:bg-white/5 hover:text-[#f0f3f8]"
                )
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="mt-auto pt-4 border-t border-[#1e2638] flex items-center justify-between text-xs text-[#8e98aa]">
            <span>Zerops Copilot</span>
            <Link to="/" className="text-indigo-400">
              Landing page →
            </Link>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-[#1e2638] bg-[#0d1017]/60 backdrop-blur flex-col sticky top-0 h-screen">
        {/* Branding Header */}
        <div className="h-16 flex items-center px-5 border-b border-[#1e2638]">
          <Link to="/app" className="focus:outline-none">
            <DevPilotLogo size="md" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    : "text-[#8e98aa] hover:bg-white/5 hover:text-[#f0f3f8] border border-transparent"
                )
              }
            >
              <item.icon size={16} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* System Status Footer */}
        <div className="px-4 py-4 border-t border-[#1e2638] bg-[#090b10]/40 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8e98aa]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Zerops API
            </span>
            <span className="text-emerald-400">Connected</span>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#8e98aa]">
            <span className="flex items-center gap-1.5">
              {health?.geminiConfigured ? (
                <Sparkles size={11} className="text-indigo-400" />
              ) : (
                <Cpu size={11} className="text-amber-400" />
              )}
              AI Engine
            </span>
            <span className={health?.geminiConfigured ? "text-indigo-300" : "text-amber-400"}>
              {health?.geminiConfigured ? "Gemini 2.5" : "Offline mock"}
            </span>
          </div>

          <div className="pt-2 border-t border-[#1e2638]/50 flex items-center justify-between text-[11px] text-[#556075]">
            <Link to="/" className="hover:text-[#8e98aa] transition-colors">
              Landing
            </Link>
            <a
              href="https://zerops.io"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-[#8e98aa] transition-colors"
            >
              Zerops Docs <ExternalLink size={10} />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

// Re-export Logo for backward compatibility
export { DevPilotLogo as Logo };
export default AppShell;
