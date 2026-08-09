export type ServiceRole = "frontend" | "backend" | "database" | "cache";

export interface ArchitectureService {
  name: string;
  technology: string;
  zeropsType: string;
  role: ServiceRole;
  port?: number;
  dependsOn: string[];
  reason?: string;
}

export interface Architecture {
  projectName: string;
  summary: string;
  services: ArchitectureService[];
  unsupported: string[];
}

export interface ValidationIssue {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

export type PipelineStage = "queued" | "building" | "deploying" | "starting" | "health_check" | "healthy" | "live" | "failed";

export interface LogLine {
  ts: string;
  stream: "build" | "runtime";
  severity: "info" | "warn" | "error";
  message: string;
}

export interface DeploymentEvent {
  ts: string;
  type: string;
  message: string;
}

export interface VerificationResult {
  serviceExists: boolean;
  deploymentCompleted: boolean;
  isRunning: boolean;
  healthCheckPassed: boolean;
  httpReachable: boolean;
  noCriticalRecentErrors: boolean;
  verifiedAt: string;
  passed: boolean;
}

export interface Diagnosis {
  summary: string;
  rootCause: string;
  category: "build_failure" | "runtime_failure" | "health_check_failure" | "network_configuration_failure" | "unknown";
  severity: "low" | "medium" | "high";
  recommendedFix: string;
  safeActions: { id: string; label: string; description: string }[];
  confidence: "low" | "medium" | "high";
  couldAutoResolve: boolean;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectName: string;
  architecture: Architecture;
  importYaml: string;
  zeropsYaml: string;
  stage: PipelineStage;
  demoMode: boolean;
  createdAt: string;
  updatedAt: string;
  liveUrl?: string;
  logs: LogLine[];
  events: DeploymentEvent[];
  verification?: VerificationResult;
  diagnosis?: Diagnosis;
  diagnosisSource?: "gemini" | "mock";
  failureStage?: PipelineStage;
  simulatedFailure?: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  createdAt: string;
  deploymentCount: number;
  successCount: number;
  latestStage: PipelineStage;
}

export type SimulatedFailure = "none" | "missing_dependency" | "health_check_failure" | "db_connection_failure";
