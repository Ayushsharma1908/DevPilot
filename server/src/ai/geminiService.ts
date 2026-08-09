import { GoogleGenAI } from "@google/genai";
import { ArchitectureSchema, DiagnosisSchema, type Architecture, type Diagnosis } from "./schemas/architecture.js";
import { ARCHITECTURE_SYSTEM_PROMPT, buildArchitectureUserPrompt } from "./prompts/architecturePrompt.js";
import { DIAGNOSIS_SYSTEM_PROMPT, buildDiagnosisUserPrompt } from "./prompts/diagnosisPrompt.js";
import { ARCHITECTURE_RESPONSE_SCHEMA, DIAGNOSIS_RESPONSE_SCHEMA } from "./responseSchemas.js";
import { AppError } from "../utils/AppError.js";
import { mockArchitectureFor, mockDiagnosisFor } from "./mockIntelligence.js";

const MODEL_NAME = "gemini-2.5-flash";

/**
 * DevPilot's AI provider is Google Gemini 2.5 Flash, accessed via the current
 * official `@google/genai` SDK (replaces the legacy, deprecated
 * `@google/generative-ai` package). See https://ai.google.dev/api/generate-content
 * and https://www.npmjs.com/package/@google/genai for the current documented API.
 */
function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

/**
 * Every AI-generated response is treated as untrusted input: it is parsed as JSON
 * and validated against a zod schema before anything downstream can use it.
 * If Gemini is unavailable (no GEMINI_API_KEY, e.g. local hackathon dev), DevPilot
 * falls back to a deterministic, clearly-labeled mock so the rest of the product
 * still functions — this is NEVER presented to the user as a real Gemini response.
 */
export async function generateArchitecture(description: string): Promise<{ architecture: Architecture; aiSource: "gemini" | "mock" }> {
  const client = getClient();

  if (!client) {
    return { architecture: mockArchitectureFor(description), aiSource: "mock" };
  }

  try {
    const result = await client.models.generateContent({
      model: MODEL_NAME,
      contents: buildArchitectureUserPrompt(description),
      config: {
        systemInstruction: ARCHITECTURE_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: ARCHITECTURE_RESPONSE_SCHEMA,
        temperature: 0.3,
      },
    });

    const raw = result.text;
    if (!raw) {
      throw new AppError(502, "AI_EMPTY_RESPONSE", "Gemini returned an empty response.");
    }

    const json = JSON.parse(raw);
    const parsed = ArchitectureSchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError(502, "AI_INVALID_OUTPUT", "Gemini returned an architecture that failed validation", parsed.error.flatten());
    }
    return { architecture: parsed.data, aiSource: "gemini" };
  } catch (err) {
    console.error("🔥 GEMINI UPSTREAM ERROR:", err);
    console.error("🔥 GEMINI ERROR MESSAGE:", err instanceof Error ? err.message : String(err));
    console.error("🔥 GEMINI ERROR STACK:", err instanceof Error ? err.stack : undefined);

    if (err instanceof AppError) throw err;
    throw new AppError(502, "AI_UPSTREAM_ERROR", "Failed to get a response from Gemini 2.5 Flash", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function generateDiagnosis(evidence: {
  stage: string;
  serviceName: string;
  buildLogs?: string[];
  runtimeLogs?: string[];
  verification?: unknown;
}): Promise<{ diagnosis: Diagnosis; aiSource: "gemini" | "mock" }> {
  const client = getClient();

  if (!client) {
    return { diagnosis: mockDiagnosisFor(evidence), aiSource: "mock" };
  }

  try {
    const result = await client.models.generateContent({
      model: MODEL_NAME,
      contents: buildDiagnosisUserPrompt(evidence),
      config: {
        systemInstruction: DIAGNOSIS_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: DIAGNOSIS_RESPONSE_SCHEMA,
        temperature: 0.2,
      },
    });

    const raw = result.text;
    if (!raw) {
      throw new AppError(502, "AI_EMPTY_RESPONSE", "Gemini returned an empty response.");
    }

    const json = JSON.parse(raw);
    const parsed = DiagnosisSchema.safeParse(json);
    if (!parsed.success) {
      throw new AppError(502, "AI_INVALID_OUTPUT", "Gemini returned a diagnosis that failed validation", parsed.error.flatten());
    }
    return { diagnosis: parsed.data, aiSource: "gemini" };
  } catch (err) {
    console.error("🔥 GEMINI UPSTREAM ERROR:", err);
    console.error("🔥 GEMINI ERROR MESSAGE:", err instanceof Error ? err.message : String(err));
    console.error("🔥 GEMINI ERROR STACK:", err instanceof Error ? err.stack : undefined);

    if (err instanceof AppError) throw err;
    throw new AppError(502, "AI_UPSTREAM_ERROR", "Failed to get a response from Gemini 2.5 Flash", {
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
