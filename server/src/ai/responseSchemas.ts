import { Type, type Schema } from "@google/genai";
import { SUPPORTED_ZEROPS_TYPES } from "./schemas/architecture.js";

/**
 * @google/genai structured-output schemas (Gemini's `responseSchema`, using the
 * SDK's `Type` enum format — NOT a JSON Schema object and NOT the zod schema
 * directly). These must describe exactly the same shape as ArchitectureSchema /
 * DiagnosisSchema in schemas/architecture.ts; the zod schemas remain the source
 * of truth for validating whatever comes back.
 */

export const ARCHITECTURE_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    projectName: { type: Type.STRING },
    summary: { type: Type.STRING },
    services: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          technology: { type: Type.STRING },
          zeropsType: { type: Type.STRING, enum: [...SUPPORTED_ZEROPS_TYPES] },
          role: { type: Type.STRING, enum: ["frontend", "backend", "database", "cache"] },
          port: { type: Type.INTEGER, nullable: true },
          dependsOn: { type: Type.ARRAY, items: { type: Type.STRING } },
          reason: { type: Type.STRING, nullable: true },
        },
        required: ["name", "technology", "zeropsType", "role", "dependsOn"],
      },
    },
    unsupported: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ["projectName", "summary", "services", "unsupported"],
};

export const DIAGNOSIS_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING },
    rootCause: { type: Type.STRING },
    category: {
      type: Type.STRING,
      enum: ["build_failure", "runtime_failure", "health_check_failure", "network_configuration_failure", "unknown"],
    },
    severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
    recommendedFix: { type: Type.STRING },
    safeActions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["id", "label", "description"],
      },
    },
    confidence: { type: Type.STRING, enum: ["low", "medium", "high"] },
    couldAutoResolve: { type: Type.BOOLEAN },
  },
  required: ["summary", "rootCause", "category", "severity", "recommendedFix", "safeActions", "confidence", "couldAutoResolve"],
};
