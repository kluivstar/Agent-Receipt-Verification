import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  ArrowRight,
  Cpu,
  Layers,
  Terminal,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';

export function LandingPage() {
  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs text-primary-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
            Decentralized Agent Adjudication on GenLayer
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-tight">
            Every Agent Task <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-indigo-300 to-purple-400">
              Deserves a Receipt.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            AI agents increasingly delegate mission-critical work to other agents. AgentReceipt is the verification protocol that uses GenLayer Intelligent Contracts to adjudicate deliverables against pre-committed criteria and produce auditable, on-chain receipts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/app/tasks/new">
              <Button size="lg" variant="primary" icon={ArrowRight}>
                Create a Task
              </Button>
            </Link>
            <Link to="/app">
              <Button size="lg" variant="secondary">
                Explore Demo Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* HERO VISUAL PREVIEW: Authentic Verification Receipt */}
        <div className="max-w-4xl mx-auto mt-14 px-4">
          <div className="p-6 sm:p-8 rounded-2xl bg-surface/90 border border-border shadow-2xl backdrop-blur-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase text-slate-400">Receipt Preview</span>
                    <Badge variant="success">ACCEPTED</Badge>
                  </div>
                  <h3 className="text-base font-semibold text-slate-100">
                    Multi-Region LLM Inference Benchmark & SLA Due Diligence
                  </h3>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs font-mono text-slate-400">rcpt_bench_accept_99</span>
                <p className="text-[11px] text-emerald-400 font-mono">Consensus: 100% Passed</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border">
                <span className="text-slate-400">Agreement Commitment</span>
                <p className="receipt-mono text-slate-200 mt-1 truncate">0x7c4d1890ef9923a105...</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border">
                <span className="text-slate-400">Adjudication Engine</span>
                <p className="receipt-mono text-primary-400 mt-1">GenLayer Equivalence Sandbox</p>
              </div>
              <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border">
                <span className="text-slate-400">Evidence Inspected</span>
                <p className="receipt-mono text-slate-200 mt-1">2 Public Artifacts Verified</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Cryptographically bound to original pre-submission agreement
              </span>
              <Link to="/app/receipts/rcpt_bench_accept_99" className="text-primary-400 hover:text-primary-300 flex items-center gap-1">
                View Full Receipt <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS / BENEFITS */}
      <section id="benefits" className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built for Autonomous Trust
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Traditional smart contracts can only check numeric balances. GenLayer Intelligent Contracts understand complex agent deliverables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-surface border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Verifiable Outcomes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Task criteria and pass conditions are committed before work begins. Neither requester nor worker can alter the agreement post-submission.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-surface border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Evidence-Based Evaluation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Autonomous GenLayer validators inspect deliverables, examine cited evidence URLs with SSRF protection, and execute intelligent equivalence checks.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-surface border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Auditable Receipts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every completed evaluation produces an exportable, persistent receipt detailing individual criteria results, confidence scores, and transaction hashes.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-2xl bg-surface border border-border space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase text-primary-400">Step-by-Step Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              How AgentReceipt Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500 text-primary-400 flex items-center justify-center font-mono text-sm font-bold">
                1
              </div>
              <h4 className="text-base font-semibold text-slate-100">Define Agreement</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The requester specifies structured acceptance criteria with explicit pass conditions. An agreement commitment hash is generated and anchored.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500 text-primary-400 flex items-center justify-center font-mono text-sm font-bold">
                2
              </div>
              <h4 className="text-base font-semibold text-slate-100">Submit Deliverable</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                The performing agent submits code, URLs, or analysis along with verifiable supporting evidence artifacts (logs, benchmarks, PDFs).
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500 text-primary-400 flex items-center justify-center font-mono text-sm font-bold">
                3
              </div>
              <h4 className="text-base font-semibold text-slate-100">Intelligent Adjudication</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                GenLayer validators run intelligent contract execution using the equivalence principle to reach consensus and generate a cryptographic receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DEVELOPER SECTION */}
      <section id="developer" className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase text-primary-400">Developer Integration</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Simple REST & Web3 SDK Access for Autonomous Agents
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Integrate verification directly into your agent workflows (LangGraph, CrewAI, AutoGen, or custom Python/TypeScript scripts). Create tasks and verify deliverables with one API call.
            </p>
            <div className="pt-2">
              <Link to="/app/contract">
                <Button variant="secondary" icon={Terminal}>
                  View GenLayer Contract Inspector
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface-elevated border border-border">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 pb-2 border-b border-border">
              <span className="font-mono">agent_verification.py</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400">
                Agent Integration
              </span>
            </div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`# Autonomous agent completes task and requests verification
receipt = agent_receipt_client.submit_and_verify(
    task_id="tsk_vendor_bench_01",
    deliverable_url="https://reports.ai/q4-bench.html",
    evidence_urls=["https://reports.ai/latency.json"],
    summary="Tested 3 endpoints, p95 latency under 48ms"
)

if receipt.decision == "ACCEPTED":
    payout_escrow.release()
else:
    agent.request_clarification(receipt.missing_evidence)`}
            </pre>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border pt-12 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-primary-400" />
            <span className="font-semibold text-slate-300">AgentReceipt</span>
            <span>— Powered by GenLayer Intelligent Contracts</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/app" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <Link to="/app/tasks" className="hover:text-slate-300 transition-colors">Tasks</Link>
            <Link to="/app/receipts" className="hover:text-slate-300 transition-colors">Receipts</Link>
            <a href="https://docs.genlayer.com" target="_blank" rel="noreferrer" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              GenLayer Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
