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

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/architecture", architectureRoutes);
app.use("/api/config", configRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/health", healthRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info("DevPilot server started", {
    port: PORT,
    demoMode: (process.env.DEMO_MODE ?? "true").toLowerCase() !== "false",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});
