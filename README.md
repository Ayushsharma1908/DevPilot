# DevPilot

**AI-powered deployment and infrastructure copilot for Zerops.**

> Describe your application. DevPilot architects it, prepares Zerops infrastructure, deploys it, verifies it, and helps fix what breaks.

Built for the **WeMakeDevs Zerops Hackathon**.

---

## Problem

Deploying a multi-service application means writing infrastructure YAML, configuring build/runtime pipelines by hand, reading logs across multiple containers, and debugging failures with no guided path back to a working state. That loop — configure, deploy, read logs, debug, redeploy — is slow and repetitive, especially for people who just want their app running.

## Solution

DevPilot turns a plain-English description into a working Zerops deployment:

```
Describe → Architect → Configure → Deploy → Verify → Recover
```

1. **Describe** — "A React frontend with a Node.js API and PostgreSQL database."
2. **Architect** — Gemini 2.5 Flash proposes a service topology; DevPilot validates it before anything is created.
3. **Configure** — DevPilot generates real Zerops **Import YAML** (infrastructure) and **zerops.yaml** (build/runtime) — shown separately, because they are different things.
4. **Deploy** — Runs the documented Zerops pipeline (queued → building → deploying → starting → health check → healthy → live), with logs and events surfaced live.
5. **Verify** — Confirms the service is actually healthy and reachable, not just "deployed."
6. **Recover** — If a deployment fails, DevPilot collects evidence (logs, events, verification) and asks Gemini for an honest root-cause diagnosis and recommended fix — never auto-executing arbitrary commands.

## Demo

The intended demo flow (see `Demo mode` below for how to reproduce it without live Zerops credentials):

1. Open DevPilot → **New Deployment**.
2. Describe: *"Deploy a React frontend with a Node.js API and PostgreSQL database."*
3. Gemini generates the architecture; DevPilot shows the service topology.
4. View the generated **Import YAML** and **zerops.yaml**, side by side and clearly labeled.
5. Validate, then **Deploy to Zerops**.
6. Watch the live pipeline, logs, and events.
7. DevPilot verifies the deployment and shows the live URL.
8. Trigger a controlled failure (a demo-mode control on the Configuration screen).
9. DevPilot shows the exact evidence (build/runtime logs), then asks Gemini 2.5 Flash for a diagnosis.
10. Review the root cause, recommended fix, and suggested review steps — then retry.

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌───────────────────────┐
│   React UI  │──────▶  Express API     │──────▶  Gemini 2.5 Flash      │
│ (Vite, TS)  │      │  (Node.js, TS)   │      │  (architecture +       │
└─────────────┘      │                  │      │   diagnosis, JSON out) │
                      │  ┌────────────┐  │      └───────────────────────┘
                      │  │ zerops/    │  │
                      │  │  configService     — generates zerops.yaml
                      │  │  importService     — generates Import YAML
                      │  │  validationService — pre-deploy checks
                      │  │  mockAdapter       — DEMO_MODE pipeline simulation
                      │  │  zeropsClient      — real zcli command wrapper
                      │  │  verificationService
                      │  │  diagnosisService
                      │  └────────────┘  │
                      └──────────────────┘
```

Every Gemini response is untrusted input: parsed as JSON and validated against a zod schema before it can influence anything downstream. The deterministic backend — not the AI — decides what's actually valid to deploy.

## How DevPilot Uses Gemini

Google **Gemini 2.5 Flash** (`gemini-2.5-flash`) is the only AI provider for DevPilot's application intelligence:

- **Requirement analysis & architecture planning** (`POST /api/architecture/analyze`) — reads the description and returns a structured service topology (name, technology, Zerops service type, role, dependencies), constrained to a small set of supported Zerops service types.
- **Failure diagnosis** (`POST /api/deployments/:id/diagnose`) — given sanitized evidence (stage, build/runtime logs, verification result), returns a root cause, severity, recommended fix, and a fixed set of safe review actions. Gemini never controls Zerops directly and never receives raw secrets.

If `GEMINI_API_KEY` isn't set, DevPilot falls back to a small deterministic keyword-based mock so the rest of the product still works — every response from it is labeled `aiSource: "mock"` end-to-end, in the API and in the UI, and it is never presented as a real Gemini response.

## How DevPilot Uses Zerops

- **Import YAML** (`docs.zerops.io/references/import`) — infrastructure-as-code: project name, service hostnames, Zerops service types (`static`, `nodejs@22`, `python@3.12`, `postgresql@16`, `valkey@7.2`), and container scaling.
- **zerops.yaml** (`docs.zerops.io/zerops-yaml/specification`) — per-service `build` (base image, buildCommands, deployFiles) and `run` (base, ports, start command, healthCheck) configuration. DevPilot keeps this **strictly separate** from Import YAML, since they configure different things.
- **Build/deploy pipeline** — DevPilot's deployment lifecycle mirrors the real Zerops pipeline shape: queued → building → deploying → starting → health check → healthy → live, with build and runtime treated as separate environments.
- **Environment references** — generated configuration uses Zerops-native service-to-service variables (e.g. `${db_hostname}`, `${db_connectionString}`) rather than inventing a connection mechanism.
- **Logs & events** — the deployment screen distinguishes build logs from runtime logs, with severity, timestamps, and filtering, and separates BUILD FAILURE / RUNTIME FAILURE / HEALTH CHECK FAILURE / NETWORK-CONFIGURATION FAILURE.
- **Verification** — after a deployment reaches a terminal stage, DevPilot checks that the service exists, the deployment completed, it's running, health checks pass, the HTTP endpoint responds, and there are no critical recent errors — success is reported as **DEPLOYED + VERIFIED**, not just deployed.
- **zCLI** — real-mode deployment (`server/src/zerops/zeropsClient.ts`) wraps only documented `zcli` commands (`project project-import`, `project service-import`, `service push`, `service log`, `service enable-subdomain`; see `docs.zerops.io/references/cli/commands`). It refuses to fake a result if `zcli`/`ZEROPS_TOKEN` aren't available — see [Demo mode](#demo-mode) below.
- **ZCP MCP** — the ZCP MCP surface (`docs.zerops.io/zcp/reference/mcp-operations`) is the natural next integration point for wiring DevPilot's backend to project-scoped, agent-friendly Zerops operations (discovery, logs, verify, deploy) instead of shelling out to `zcli`. Not wired into this hackathon build; the abstraction in `zerops/` is written so that swap is isolated to one file.

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, React Router, TanStack Query, lucide-react
- **Backend:** Node.js, Express, TypeScript, zod
- **AI:** Google Gemini 2.5 Flash (`@google/genai`, Google's current official JS SDK)
- **Infra target:** Zerops (Import YAML + zerops.yaml + zCLI)

## Project Structure

```
devpilot/
├── server/
│   └── src/
│       ├── ai/            # Gemini service, prompts, zod schemas, offline mock
│       ├── zerops/         # config/import generation, validation, deployment
│       │                    # engine (demo simulation + real zcli client),
│       │                    # verification, diagnosis, in-memory store
│       ├── routes/         # architecture, config, deployments, projects, health
│       ├── middleware/     # error handling, request validation
│       ├── types/          # shared domain types
│       └── utils/          # AppError, structured logger
└── client/
    └── src/
        ├── api/            # typed fetch client
        ├── components/     # AppShell, PipelineRail, ServiceTopology, CodeBlock…
        ├── pages/           # Landing, Overview, NewDeployment, Architecture,
        │                     # Configuration, Deployment, DeploymentsList
        ├── lib/            # stage helpers, FlowContext (describe→deploy state)
        └── types/          # shared domain types (mirrors server)
```

## Local Setup

```bash
git clone <this-repo>
cd devpilot
npm run install:all

cp server/.env.example server/.env
# add GEMINI_API_KEY to server/.env for real Gemini analysis (optional — falls
# back to a labeled offline mock otherwise)

npm run dev
```

- Backend: `http://localhost:8787`
- Frontend: `http://localhost:5173` (proxies `/api` to the backend)

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Enables real Gemini 2.5 Flash analysis/diagnosis. Without it, DevPilot uses a labeled offline mock. |
| `DEMO_MODE` | Optional (default `true`) | `true` runs a clearly-labeled simulated Zerops pipeline. `false` requires real Zerops access (see below). |
| `ZEROPS_TOKEN` | Required if `DEMO_MODE=false` | Zerops personal access token used by `zcli`. |
| `PORT` | Optional (default `8787`) | Backend port. |

Never commit `.env`. `.gitignore` already excludes it.

## Demo Mode

Because this is a 48-hour hackathon build, `DEMO_MODE=true` (the default) drives the deployment pipeline through a controlled, clearly-labeled simulation — every simulated log line and event is prefixed `[simulated]`, and the deployment screen shows "Demo mode (simulated)" in its subtitle. Architecture generation (when `GEMINI_API_KEY` is set), validation, and configuration generation are real throughout.

`DEMO_MODE=false` routes deployment through `server/src/zerops/zeropsClient.ts`, which only wraps documented `zcli` commands. It will not fake a result — if `zcli` isn't installed or `ZEROPS_TOKEN` isn't set, it returns a clear, actionable error instead of a false success.

The Configuration screen includes a small "Demo controls" selector to trigger one of three scripted failure scenarios (missing dependency, health check failure, database connection failure) so the AI recovery flow can be demoed reliably.

## Security

- Zerops credentials (`ZEROPS_TOKEN`) and the Gemini API key live only on the server; neither is ever sent to the browser.
- No arbitrary command execution: the real-mode Zerops client only exposes a fixed set of documented `zcli` subcommands. Gemini never generates or executes shell commands.
- Every AI response (architecture, diagnosis) is parsed and validated against a zod schema before use; invalid output is rejected rather than passed through.
- Diagnosis evidence sent to Gemini is sanitized log/event/verification data — never raw environment variables or secrets.

## AI Disclosure

**Google Gemini 2.5 Flash** powers DevPilot's application-facing AI features (architecture analysis and failure diagnosis). **Claude** was used as a development/coding assistant while building DevPilot; it is not part of the running application.
