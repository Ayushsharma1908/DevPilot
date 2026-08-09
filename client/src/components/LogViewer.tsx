import { useState, useMemo, useRef, useEffect } from "react";
import type { LogLine } from "../types/domain";
import {
  Copy,
  Check,
  Search,
  Terminal,
  ArrowDown,
  Download,
} from "lucide-react";
import clsx from "clsx";

export interface LogViewerProps {
  logs: LogLine[];
  className?: string;
  maxHeight?: string;
}

export function LogViewer({ logs, className, maxHeight = "420px" }: LogViewerProps) {
  const [streamFilter, setStreamFilter] = useState<"all" | "build" | "runtime">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | "info" | "warn" | "error">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (streamFilter !== "all" && log.stream !== streamFilter) return false;
      if (severityFilter !== "all" && log.severity !== severityFilter) return false;
      if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [logs, streamFilter, severityFilter, searchQuery]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  async function copyAllLogs() {
    const formatted = filteredLogs
      .map(
        (l) =>
          `[${new Date(l.ts).toISOString()}] [${l.stream.toUpperCase()}] [${l.severity.toUpperCase()}] ${l.message}`
      )
      .join("\n");
    await navigator.clipboard.writeText(formatted);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  async function copySingleLine(message: string, index: number) {
    await navigator.clipboard.writeText(message);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  function downloadLogs() {
    const formatted = logs
      .map(
        (l) =>
          `[${new Date(l.ts).toISOString()}] [${l.stream.toUpperCase()}] [${l.severity.toUpperCase()}] ${l.message}`
      )
      .join("\n");
    const blob = new Blob([formatted], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deployment-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.log`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const buildCount = logs.filter((l) => l.stream === "build").length;
  const runtimeCount = logs.filter((l) => l.stream === "runtime").length;

  return (
    <div
      className={clsx(
        "rounded-xl border border-[#1e2638] bg-[#0d1017] overflow-hidden shadow-lg font-mono text-xs",
        className
      )}
    >
      {/* Log Controls Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[#1e2638] bg-[#11151f]/90 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-display font-medium text-sm text-[#f0f3f8]">
            <Terminal size={15} className="text-indigo-400" />
            <span>Logs</span>
            <span className="rounded bg-[#1e2638] px-1.5 py-0.5 text-[11px] font-mono text-[#8e98aa]">
              {filteredLogs.length}
            </span>
          </div>

          {/* Stream Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-[#1e2638] bg-[#080a0f] p-0.5">
            <button
              type="button"
              onClick={() => setStreamFilter("all")}
              className={clsx(
                "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                streamFilter === "all"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-[#8e98aa] hover:text-[#f0f3f8]"
              )}
            >
              All ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setStreamFilter("build")}
              className={clsx(
                "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                streamFilter === "build"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-[#8e98aa] hover:text-[#f0f3f8]"
              )}
            >
              Build ({buildCount})
            </button>
            <button
              type="button"
              onClick={() => setStreamFilter("runtime")}
              className={clsx(
                "rounded px-2.5 py-1 text-[11px] font-medium transition-colors",
                streamFilter === "runtime"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  : "text-[#8e98aa] hover:text-[#f0f3f8]"
              )}
            >
              Runtime ({runtimeCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search Box */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#556075]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="w-36 sm:w-44 rounded-lg border border-[#1e2638] bg-[#080a0f] pl-7 pr-2.5 py-1 text-xs text-[#f0f3f8] placeholder-[#556075] outline-none focus:border-indigo-500/60"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="rounded-lg border border-[#1e2638] bg-[#080a0f] px-2 py-1 text-xs text-[#8e98aa] outline-none"
          >
            <option value="all">Severity: All</option>
            <option value="info">Info only</option>
            <option value="warn">Warnings</option>
            <option value="error">Errors</option>
          </select>

          {/* Action Buttons */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={clsx(
              "flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] transition-colors",
              autoScroll
                ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
                : "border-[#1e2638] bg-[#080a0f] text-[#8e98aa]"
            )}
            title="Auto-scroll on new logs"
          >
            <ArrowDown size={12} className={autoScroll ? "animate-bounce" : ""} />
            <span className="hidden sm:inline">Follow</span>
          </button>

          <button
            type="button"
            onClick={downloadLogs}
            className="flex items-center gap-1 rounded-lg border border-[#1e2638] bg-[#080a0f] px-2 py-1 text-[11px] text-[#8e98aa] hover:text-[#f0f3f8] transition-colors"
            title="Download full log"
          >
            <Download size={12} />
          </button>

          <button
            type="button"
            onClick={copyAllLogs}
            className="flex items-center gap-1 rounded-lg border border-[#1e2638] bg-[#080a0f] px-2.5 py-1 text-[11px] text-[#8e98aa] hover:text-[#f0f3f8] transition-colors"
          >
            {copiedAll ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copiedAll ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Log Body */}
      <div
        ref={scrollRef}
        className="overflow-y-auto p-3 divide-y divide-[#1e2638]/40 space-y-0.5 scrollbar-thin"
        style={{ maxHeight }}
      >
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-[#556075]">
            <Terminal size={20} className="mx-auto mb-2 opacity-50" />
            <p>No log messages match the current filter.</p>
          </div>
        ) : (
          filteredLogs.map((log, idx) => {
            const isError = log.severity === "error";
            const isWarn = log.severity === "warn";
            const isCopied = copiedIndex === idx;

            return (
              <div
                key={idx}
                className={clsx(
                  "group flex items-start gap-3 py-1 px-2 rounded transition-colors text-[12px] leading-relaxed",
                  isError && "bg-rose-500/5 text-rose-300",
                  isWarn && "bg-amber-500/5 text-amber-300",
                  !isError && !isWarn && "hover:bg-white/[0.02] text-[#c5cddb]"
                )}
              >
                {/* Timestamp */}
                <span className="text-[#556075] select-none text-[11px] shrink-0 pt-0.5">
                  {new Date(log.ts).toLocaleTimeString()}
                </span>

                {/* Stream Pill */}
                <span
                  className={clsx(
                    "rounded px-1.5 py-0.2 text-[10px] uppercase font-bold tracking-wider shrink-0 select-none",
                    log.stream === "build"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                  )}
                >
                  {log.stream}
                </span>

                {/* Severity Pill */}
                <span
                  className={clsx(
                    "rounded px-1 py-0.2 text-[9px] uppercase font-bold shrink-0 select-none",
                    isError && "bg-rose-500/20 text-rose-300 border border-rose-500/30",
                    isWarn && "bg-amber-500/20 text-amber-300 border border-amber-500/30",
                    !isError && !isWarn && "text-[#556075]"
                  )}
                >
                  {log.severity}
                </span>

                {/* Message */}
                <span className="flex-1 break-all font-mono select-text">
                  {log.message}
                </span>

                {/* Copy single line button */}
                <button
                  type="button"
                  onClick={() => copySingleLine(log.message, idx)}
                  className="opacity-0 group-hover:opacity-100 text-[#556075] hover:text-[#f0f3f8] transition-opacity p-0.5 shrink-0"
                  title="Copy line"
                >
                  {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default LogViewer;
