import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import architectureRoutes from "./routes/architecture.js";
import configRoutes from "./routes/config.js";
import deploymentRoutes from "./routes/deployment.js";
import projectRoutes from "./routes/projects.js";
import healthRoutes from "./routes/health.js";
import { logger } from "./utils/logger.js";

const app = express();
const PORT = Number(process.env.PORT ?? 8787);

// Startup diagnostics — visible in Zerops application logs immediately on launch
console.log("=== DevPilot API starting ===");
console.log(`NODE_ENV=${process.env.NODE_ENV ?? "not set"}`);
console.log(`PORT=${PORT} (from env: ${process.env.PORT ?? "not set, using default 8787"})`);
console.log(`DEMO_MODE=${process.env.DEMO_MODE ?? "not set (defaults to true)"}`);
console.log(`GEMINI_API_KEY=${process.env.GEMINI_API_KEY ? "configured" : "not set"}`);

const allowedOrigin = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/architecture", architectureRoutes);
app.use("/api/config", configRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/health", healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
  logger.info("DevPilot server started", {
    port: PORT,
    demoMode: (process.env.DEMO_MODE ?? "true").toLowerCase() !== "false",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});