import type { Architecture, Diagnosis } from "./schemas/architecture.js";

/**
 * Simple keyword-based deterministic architecture builder. This exists ONLY so
 * DevPilot remains usable when GEMINI_API_KEY is not configured (e.g. quick local
 * checks). It is intentionally unsophisticated — real requirement analysis is
 * Gemini 2.5 Flash's job. The API always reports aiSource: "mock" alongside this.
 */
export function mockArchitectureFor(description: string): Architecture {
  const text = description.toLowerCase();

  const explicitlyNoFrontend = /no frontend|api only|backend only|without a frontend|no ui/.test(text);
  const wantsFrontend = !explicitlyNoFrontend && /react|frontend|vite|\bui\b|web app|website/.test(text);
  const wantsPython = /python|django|flask|fastapi/.test(text);
  const wantsBackend = /api|backend|server|node|express|python|django|flask|fastapi/.test(text) || wantsPython;
  const wantsDb = /postgres|database|db|sql/.test(text);
  const wantsCache = /cache|redis|valkey|session/.test(text);

  const services: Architecture["services"] = [];
  const unsupported: string[] = [];

  if (wantsFrontend) {
    services.push({
      name: "frontend",
      technology: "React + Vite (static build)",
      zeropsType: "static",
      role: "frontend",
      dependsOn: wantsBackend ? ["api"] : [],
      reason: "Detected a frontend/UI requirement; served as a static build on Zerops.",
    });
  }

  if (wantsBackend) {
    services.push({
      name: "api",
      technology: wantsPython ? "Python API" : "Node.js API",
      zeropsType: wantsPython ? "python@3.12" : "nodejs@22",
      role: "backend",
      port: 3000,
      dependsOn: wantsDb ? ["db"] : [],
      reason: "Detected an API/backend requirement.",
    });
  }

  if (wantsDb) {
    services.push({
      name: "db",
      technology: "PostgreSQL",
      zeropsType: "postgresql@16",
      role: "database",
      dependsOn: [],
      reason: "Detected a database requirement.",
    });
  }

  if (wantsCache) {
    services.push({
      name: "cache",
      technology: "Valkey",
      zeropsType: "valkey@7.2",
      role: "cache",
      dependsOn: [],
      reason: "Detected a caching requirement.",
    });
  }

  if (services.length === 0) {
    services.push({
      name: "api",
      technology: "Node.js API",
      zeropsType: "nodejs@22",
      role: "backend",
      port: 3000,
      dependsOn: [],
      reason: "Fallback default service — description was too sparse to detect specifics.",
    });
    unsupported.push("Could not clearly detect requirements from the description; defaulted to a single Node.js API service.");
  }

  if (/kafka|kubernetes|multi-region|k8s/.test(text)) {
    unsupported.push("Requested infrastructure (Kafka/Kubernetes/multi-region) is outside this hackathon build's supported scope.");
  }

  return {
    projectName: "devpilot-app",
    summary: `Mock (offline) architecture inferred from keywords in the description — configure GEMINI_API_KEY for real Gemini 2.5 Flash analysis.`,
    services,
    unsupported,
  };
}

export function mockDiagnosisFor(evidence: {
  stage: string;
  buildLogs?: string[];
  runtimeLogs?: string[];
}): Diagnosis {
  const buildText = (evidence.buildLogs ?? []).join("\n").toLowerCase();
  const runtimeText = (evidence.runtimeLogs ?? []).join("\n").toLowerCase();

  if (buildText.includes("cannot find module") || buildText.includes("module not found")) {
    return {
      summary: "Build failed due to a missing dependency (mock diagnosis — no GEMINI_API_KEY set).",
      rootCause: "The build logs show a missing Node module, meaning a required package was not installed before the build ran, or is missing from package.json.",
      category: "build_failure",
      severity: "high",
      recommendedFix: "Confirm the missing package is listed in package.json dependencies and that `npm install` runs before the build command in zerops.yaml.",
      safeActions: [
        { id: "review_dependencies", label: "Review dependencies", description: "Check package.json against the missing module name in the logs." },
        { id: "review_build_command", label: "Review build command", description: "Confirm buildCommands installs dependencies before building." },
      ],
      confidence: "medium",
      couldAutoResolve: false,
    };
  }

  if (evidence.stage === "health_check" || runtimeText.includes("econnrefused") || runtimeText.includes("health")) {
    return {
      summary: "Health check failed after the application started (mock diagnosis — no GEMINI_API_KEY set).",
      rootCause: "The application container started, but the configured health check endpoint did not respond as expected — likely a port or path mismatch.",
      category: "health_check_failure",
      severity: "medium",
      recommendedFix: "Verify the healthCheck.httpGet.port and path in zerops.yaml match where the application actually listens.",
      safeActions: [
        { id: "review_health_check_config", label: "Review health check config", description: "Compare configured health check port/path against the app's actual listener." },
        { id: "review_port_config", label: "Review port config", description: "Confirm the run.ports entry matches the app's listening port." },
      ],
      confidence: "medium",
      couldAutoResolve: false,
    };
  }

  return {
    summary: "Deployment failed and the available evidence is limited (mock diagnosis — no GEMINI_API_KEY set).",
    rootCause: "Not enough log detail was available to determine a specific root cause with confidence.",
    category: "unknown",
    severity: "medium",
    recommendedFix: "Review the full build and runtime logs manually, or configure GEMINI_API_KEY for a real Gemini 2.5 Flash diagnosis.",
    safeActions: [{ id: "retry_deployment", label: "Retry deployment", description: "If this looked like a transient issue, retry once before deeper investigation." }],
    confidence: "low",
    couldAutoResolve: false,
  };
}
