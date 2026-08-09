type LogFields = Record<string, unknown>;

/**
 * Minimal structured logger. Every deployment-related operation should log
 * requestId, project, service, operation, timestamp, status, and error (if any)
 * as required by the observability spec, so debugging is straightforward from
 * plain stdout (kept dependency-free for a 48h hackathon build).
 */
function emit(level: "info" | "warn" | "error", message: string, fields: LogFields = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, fields?: LogFields) => emit("info", message, fields),
  warn: (message: string, fields?: LogFields) => emit("warn", message, fields),
  error: (message: string, fields?: LogFields) => emit("error", message, fields),
};
