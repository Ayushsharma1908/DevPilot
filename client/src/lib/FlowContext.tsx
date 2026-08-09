import { createContext, useContext, useState, type ReactNode } from "react";
import type { Architecture, ValidationResult } from "../types/domain";

interface FlowState {
  description: string;
  architecture: Architecture | null;
  aiSource: "gemini" | "mock" | null;
  validation: ValidationResult | null;
  importYaml: string;
  zeropsYaml: string;
}

interface FlowContextValue extends FlowState {
  setDescription: (v: string) => void;
  setArchitecture: (a: Architecture, aiSource: "gemini" | "mock", validation: ValidationResult) => void;
  setConfig: (importYaml: string, zeropsYaml: string) => void;
  reset: () => void;
}

const initial: FlowState = {
  description: "",
  architecture: null,
  aiSource: null,
  validation: null,
  importYaml: "",
  zeropsYaml: "",
};

const FlowContext = createContext<FlowContextValue | null>(null);

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FlowState>(initial);

  const value: FlowContextValue = {
    ...state,
    setDescription: (v) => setState((s) => ({ ...s, description: v })),
    setArchitecture: (architecture, aiSource, validation) => setState((s) => ({ ...s, architecture, aiSource, validation })),
    setConfig: (importYaml, zeropsYaml) => setState((s) => ({ ...s, importYaml, zeropsYaml })),
    reset: () => setState(initial),
  };

  return <FlowContext.Provider value={value}>{children}</FlowContext.Provider>;
}

export function useFlow() {
  const ctx = useContext(FlowContext);
  if (!ctx) throw new Error("useFlow must be used within FlowProvider");
  return ctx;
}
