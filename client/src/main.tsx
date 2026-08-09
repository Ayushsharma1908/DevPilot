import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { AppShell } from "./components/AppShell";
import { Landing } from "./pages/Landing";
import { Overview } from "./pages/Overview";
import { NewDeployment } from "./pages/NewDeployment";
import { ArchitecturePage } from "./pages/ArchitecturePage";
import { ConfigurationPage } from "./pages/ConfigurationPage";
import { DeploymentPage } from "./pages/DeploymentPage";
import { DeploymentsList } from "./pages/DeploymentsList";
import { FlowProvider } from "./lib/FlowContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FlowProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<AppShell />}>
              <Route index element={<Overview />} />
              <Route path="new" element={<NewDeployment />} />
              <Route path="architecture" element={<ArchitecturePage />} />
              <Route path="configuration" element={<ConfigurationPage />} />
              <Route path="deployments" element={<DeploymentsList />} />
              <Route path="deployments/:id" element={<DeploymentPage />} />
              <Route path="activity" element={<DeploymentsList />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FlowProvider>
    </QueryClientProvider>
  </StrictMode>
);
