import { useState } from "react";
import { Check, Copy, Download, FileCode } from "lucide-react";
import clsx from "clsx";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
}

export function CodeBlock({
  code,
  language = "yaml",
  filename,
  showLineNumbers = true,
  maxHeight = "500px",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadFile() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `config.${language === "yaml" ? "yaml" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const lines = code.trim().split("\n");

  return (
    <div
      className={clsx(
        "rounded-xl border border-[#1e2638] bg-[#0d1017] overflow-hidden shadow-lg font-mono text-xs",
        className
      )}
    >
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e2638] bg-[#11151f]/90 text-[#8e98aa]">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-indigo-400" />
          <span className="font-medium text-[#f0f3f8]">{filename ?? language}</span>
          <span className="text-[11px] text-[#556075]">({lines.length} lines)</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={downloadFile}
            title="Download file"
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-[#8e98aa] hover:bg-white/5 hover:text-[#f0f3f8] transition-colors"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            type="button"
            onClick={copyToClipboard}
            className={clsx(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all",
              copied
                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                : "text-[#8e98aa] hover:bg-white/5 hover:text-[#f0f3f8]"
            )}
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div
        className="overflow-auto p-4 scrollbar-thin"
        style={{ maxHeight }}
      >
        <pre className="text-[13px] leading-relaxed">
          <code>
            {showLineNumbers ? (
              <table className="border-collapse w-full">
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="w-8 pr-4 text-right select-none text-[#404b60] text-[11px] align-top">
                        {idx + 1}
                      </td>
                      <td className="text-[#e2e8f0] whitespace-pre font-mono">
                        {highlightYamlLine(line)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              code
            )}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Simple deterministic YAML syntax styling helper for high readability
function highlightYamlLine(line: string) {
  // Comments
  if (line.trim().startsWith("#")) {
    return <span className="text-[#556075] italic">{line}</span>;
  }

  // Key-value pairs
  const colonIndex = line.indexOf(":");
  if (colonIndex > 0) {
    const key = line.substring(0, colonIndex + 1);
    const rest = line.substring(colonIndex + 1);
    return (
      <>
        <span className="text-indigo-300 font-medium">{key}</span>
        <span className="text-[#c5cddb]">{rest}</span>
      </>
    );
  }

  // List dash items
  if (line.trim().startsWith("- ")) {
    return <span className="text-sky-300">{line}</span>;
  }

  return <span className="text-[#e2e8f0]">{line}</span>;
}

export default CodeBlock;
