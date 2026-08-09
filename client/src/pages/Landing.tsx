import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, GitBranch, ShieldCheck, Sparkles, Terminal, Wrench } from "lucide-react";
import { Logo } from "../components/AppShell";
import { PipelineRail } from "../components/PipelineRail";
import type { PipelineStage } from "../types/domain";

const DEMO_STAGES: PipelineStage[] = ["queued", "building", "deploying", "starting", "health_check", "healthy", "live"];

function useCyclingStage() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % (DEMO_STAGES.length + 3)), 1100);
    return () => clearInterval(t);
  }, []);
  return DEMO_STAGES[Math.min(i, DEMO_STAGES.length - 1)];
}

const TRADITIONAL = ["Code", "Configure infra", "Write YAML", "Deploy", "Read logs", "Debug", "Redeploy", "Verify"];
const DEVPILOT = ["Describe", "Architect", "Configure", "Deploy", "Verify", "Recover"];

export function Landing() {
  const stage = useCyclingStage();

  return (
    <div style={{ background: "var(--color-bg)" }} className="min-h-screen text-[15px]">
      <header className="border-b sticky top-0 z-20 backdrop-blur" style={{ borderColor: "var(--color-border)", background: "#0a0c11cc" }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#zerops" className="hover:text-white transition-colors">Zerops integration</a>
            <a href="#recovery" className="hover:text-white transition-colors">AI recovery</a>
          </nav>
          <Link
            to="/app/new"
            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-bright))" }}
          >
            Start Deploying
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-grid border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(600px circle at 15% -10%, #6c5ce733, transparent)" }} />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono mb-6" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}>
            <Sparkles size={12} style={{ color: "var(--color-brand-bright)" }} />
            Built for the WeMakeDevs Zerops Hackathon
          </div>
          <h1 className="font-display font-semibold tracking-tight text-5xl md:text-6xl leading-[1.05] max-w-3xl">
            AI-powered deployment,
            <br />
            without the DevOps headache.
          </h1>
          <p className="mt-6 max-w-xl text-lg" style={{ color: "var(--color-text-muted)" }}>
            Describe your application. DevPilot architects it, prepares Zerops infrastructure, deploys it, verifies it, and helps fix what breaks.
          </p>
          <div className="mt-9 flex items-center gap-4">
            <Link
              to="/app/new"
              className="group inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-bright))" }}
            >
              Start Deploying
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <span className="text-sm font-mono" style={{ color: "var(--color-text-faint)" }}>
              Gemini 2.5 Flash + Zerops
            </span>
          </div>

          <div className="mt-16 rounded-2xl border p-6 md:p-8" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-mono" style={{ color: "var(--color-text-faint)" }}>
                live-deployment-preview.zerops.app
              </span>
              <span className="text-xs font-mono" style={{ color: "var(--color-text-faint)" }}>
                simulated for illustration
              </span>
            </div>
            <PipelineRail stage={stage} />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading eyebrow="How it works" title="Traditional deployment vs. DevPilot" />
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <FlowCard title="Traditional" steps={TRADITIONAL} tone="muted" />
          <FlowCard title="DevPilot" steps={DEVPILOT} tone="brand" />
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section id="architecture" className="border-y" style={{ borderColor: "var(--color-border)", background: "var(--color-bg-raised)" }}>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <SectionHeading eyebrow="Under the hood" title="One architecture engine, three real integrations" />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <FeatureCard icon={Sparkles} title="Gemini 2.5 Flash" body="Reads your plain-English description and proposes a service topology — validated by a deterministic backend before anything is provisioned." />
            <FeatureCard icon={Boxes} title="Zerops infrastructure" body="Generates real Import YAML and zerops.yaml, following Zerops' documented project → service → container model." />
            <FeatureCard icon={ShieldCheck} title="Verified, not assumed" body="DevPilot checks health, HTTP readiness, and recent errors after deploy — success means DEPLOYED + VERIFIED." />
          </div>
        </div>
      </section>

      {/* ZEROPS INTEGRATION */}
      <section id="zerops" className="mx-auto max-w-6xl px-6 py-24">
        <SectionHeading eyebrow="Zerops integration" title="Real mechanisms, not invented ones" />
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <FeatureCard icon={GitBranch} title="Import YAML vs zerops.yaml" body="Import YAML provisions the project and services. zerops.yaml controls how each service builds and runs. DevPilot keeps them distinct, exactly as Zerops documents them." />
          <FeatureCard icon={Terminal} title="zCLI & ZCP" body="Deployment uses the documented zcli service push/deploy pipeline. No arbitrary shell execution — every operation maps to a real, documented command." />
        </div>
      </section>

      {/* RECOVERY */}
      <section id="recovery" className="border-t" style={{ borderColor: "var(--color-border)", background: "var(--color-bg-raised)" }}>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <SectionHeading eyebrow="When things break" title="Evidence first, then an honest diagnosis" />
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <FeatureCard icon={Wrench} title="Collect evidence" body="Build logs, runtime logs, events, and verification results are gathered before any AI is involved." />
            <FeatureCard icon={Sparkles} title="Gemini diagnoses" body="Sanitized evidence goes to Gemini 2.5 Flash for root cause, recommended fix, and safe next actions — never raw commands." />
            <FeatureCard icon={ShieldCheck} title="You stay in control" body="DevPilot never executes AI-generated commands automatically. If it can't determine a safe fix, it says so." />
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-10" style={{ borderColor: "var(--color-border)" }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between text-xs font-mono" style={{ color: "var(--color-text-faint)" }}>
          <span>DevPilot — built for the WeMakeDevs Zerops Hackathon</span>
          <span>Gemini 2.5 Flash powers DevPilot's AI features. Claude assisted development.</span>
        </div>
      </footer>
    </div>
  );

}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--color-brand-bright)" }}>
        {eyebrow}
      </div>
      <h2 className="font-display font-semibold text-3xl md:text-4xl tracking-tight max-w-2xl">{title}</h2>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ size?: number }>; title: string; body: string }) {
  return (
    <div className="rounded-xl border p-6" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ background: "var(--color-brand-soft)", color: "var(--color-brand-bright)" }}
      >
        <Icon size={18} />
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
        {body}
      </p>
    </div>
  );
}

function FlowCard({ title, steps, tone }: { title: string; steps: string[]; tone: "muted" | "brand" }) {
  const accent = tone === "brand" ? "var(--color-brand-bright)" : "var(--color-text-faint)";
  return (
    <div
      className="rounded-xl border p-6"
      style={{
        borderColor: tone === "brand" ? "var(--color-brand)55" : "var(--color-border)",
        background: tone === "brand" ? "var(--color-brand-soft)" : "var(--color-surface)",
      }}
    >
      <h3 className="font-display font-semibold text-lg mb-5" style={{ color: tone === "brand" ? "white" : "var(--color-text-muted)" }}>
        {title}
      </h3>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={s} className="flex items-center gap-3 text-sm">
            <span className="font-mono text-xs w-5 shrink-0" style={{ color: accent }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ color: tone === "brand" ? "var(--color-text)" : "var(--color-text-muted)" }}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
