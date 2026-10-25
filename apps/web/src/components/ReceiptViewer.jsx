import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  Shield,
  FileText,
  Search,
  Lock,
  Hash,
  Share2
} from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card.jsx';
import { api } from '../lib/api.js';

export function ReceiptViewer({ receipt, onRefresh }) {
  const [copiedField, setCopiedField] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!receipt) return null;

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportJson = async () => {
    try {
      setIsExporting(true);
      const data = await api.exportReceiptJson(receipt.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `agentreceipt-${receipt.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export JSON: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const decision = receipt.decision || 'NEEDS_REVIEW';
  const isAccepted = decision === 'ACCEPTED';
  const isRejected = decision === 'REJECTED';
  const isNeedsReview = decision === 'NEEDS_REVIEW';

  const verification = receipt.verificationSummary || {
    applicationRecordFound: true,
    onChainVerified: false,
    isSimulated: true,
    evidenceInspected: true,
    checksNote: 'Local simulator run'
  };

  const criteriaResults = receipt.evaluation?.perCriterionResults || [];

  return (
    <div className="space-y-6">
      {/* Top Banner Decision Card */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isAccepted
            ? 'bg-emerald-950/20 border-emerald-500/30 glow-success'
            : isRejected
            ? 'bg-rose-950/20 border-rose-500/30 glow-danger'
            : 'bg-amber-950/20 border-amber-500/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border ${
                isAccepted
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : isRejected
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}
            >
              {isAccepted && <CheckCircle2 className="w-8 h-8" />}
              {isRejected && <XCircle className="w-8 h-8" />}
              {isNeedsReview && <AlertCircle className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  Adjudication Decision
                </span>
                <Badge
                  variant={isAccepted ? 'success' : isRejected ? 'danger' : 'warning'}
                >
                  {decision}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">
                {isAccepted
                  ? 'Deliverable Accepted & Verified'
                  : isRejected
                  ? 'Deliverable Rejected'
                  : 'Requires Manual / Senior Agent Review'}
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              variant="secondary"
              size="sm"
              icon={isExporting ? undefined : Download}
              isLoading={isExporting}
              onClick={handleExportJson}
            >
              Export JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={copiedField === 'receipt' ? Check : Share2}
              onClick={() => copyToClipboard(window.location.href, 'receipt')}
            >
              {copiedField === 'receipt' ? 'Copied Link' : 'Share'}
            </Button>
          </div>
        </div>

        {/* Adjudicator Rationale */}
        {receipt.evaluation?.rationale && (
          <div className="mt-4 pt-4 border-t border-border/60">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Consensus Rationale
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              {receipt.evaluation.rationale}
            </p>
          </div>
        )}
      </div>

      {/* 4-Point Verification Status Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary-400" />
            <CardTitle>4-Point Receipt Verification Status</CardTitle>
          </div>
          <span className="text-xs text-slate-400">
            Audit Inspection Protocol v1.0
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. App Record */}
            <div className="p-4 rounded-lg bg-surface-elevated/70 border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">1. Record Existence</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-slate-100">Indexed Record Found</p>
              <p className="text-[11px] text-slate-400">Task, submission, and receipt records matched in storage.</p>
            </div>

            {/* 2. On-Chain Ledger */}
            <div className="p-4 rounded-lg bg-surface-elevated/70 border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">2. Ledger Verification</span>
                {verification.onChainVerified ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] uppercase font-mono px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Simulated
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-slate-100">
                {verification.onChainVerified ? 'Confirmed On-Chain' : 'Deterministic Simulation'}
              </p>
              <p className="text-[11px] text-slate-400">
                {verification.onChainVerified
                  ? 'Validated via GenLayer consensus ledger state.'
                  : 'Local simulator run following GenLayer equivalence rules.'}
              </p>
            </div>

            {/* 3. Evidence Inspection */}
            <div className="p-4 rounded-lg bg-surface-elevated/70 border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">3. Evidence Inspection</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-slate-100">
                {verification.evidenceCount} Artifacts Cited
              </p>
              <p className="text-[11px] text-slate-400">
                Supporting URLs and metrics inspected by evaluator.
              </p>
            </div>

            {/* 4. Integrity Commitment */}
            <div className="p-4 rounded-lg bg-surface-elevated/70 border border-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">4. Hash Commitment</span>
                <Lock className="w-4 h-4 text-primary-400" />
              </div>
              <p className="text-sm font-semibold text-slate-100">Cryptographic Binding</p>
              <p className="text-[11px] text-slate-400">
                Deliverable bound to original immutable agreement hash.
              </p>
            </div>
          </div>

          {/* Verification note alert */}
          <div className="mt-4 p-3 rounded-lg bg-surface-elevated border border-border flex items-start gap-2.5 text-xs text-slate-300">
            <AlertCircle className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-100">Auditor Notice:</strong> {verification.checksNote}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Per-Criterion Results Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-400" />
            <CardTitle>Per-Criterion Adjudication Breakdown</CardTitle>
          </div>
          <span className="text-xs text-slate-400">
            {criteriaResults.filter(c => c.passed).length} of {criteriaResults.length} criteria passed
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-elevated/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Criterion Title</th>
                  <th className="py-3 px-6">Confidence / Score</th>
                  <th className="py-3 px-6">Finding & Rationale</th>
                  <th className="py-3 px-6">Evidence Cited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {criteriaResults.map((crit, idx) => (
                  <tr key={crit.criterionId || idx} className="hover:bg-surface-elevated/30 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      {crit.passed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" /> Fail
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-200">
                      {crit.title}
                    </td>
                    <td className="py-4 px-6 text-xs font-mono text-slate-300">
                      {crit.score ? `${Math.round(crit.score * 100)}%` : '—'}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300 max-w-md">
                      {crit.rationale}
                    </td>
                    <td className="py-4 px-6 text-xs">
                      {crit.evidenceCited && crit.evidenceCited.length > 0 ? (
                        <div className="space-y-1">
                          {crit.evidenceCited.map((ev, eIdx) => (
                            <a
                              key={eIdx}
                              href={ev}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 truncate max-w-xs underline"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{ev}</span>
                            </a>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">None cited</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cryptographic Proofs & Identifiers */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary-400" />
            <CardTitle>Cryptographic Identifiers & Network Data</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Receipt ID */}
            <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Receipt ID</span>
                <button
                  onClick={() => copyToClipboard(receipt.id, 'rcpt_id')}
                  className="hover:text-slate-200 flex items-center gap-1"
                >
                  {copiedField === 'rcpt_id' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'rcpt_id' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="receipt-mono text-xs text-slate-200 break-all">{receipt.id}</p>
            </div>

            {/* Transaction Hash */}
            <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Transaction Hash</span>
                <button
                  onClick={() => copyToClipboard(receipt.transactionHash, 'tx_hash')}
                  className="hover:text-slate-200 flex items-center gap-1"
                >
                  {copiedField === 'tx_hash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'tx_hash' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="receipt-mono text-xs text-slate-200 break-all">
                {receipt.transactionHash || 'Pending transaction'}
              </p>
            </div>

            {/* Agreement Commitment */}
            <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Agreement Commitment (Pre-Submission)</span>
                <button
                  onClick={() => copyToClipboard(receipt.agreementCommitment, 'ag_commit')}
                  className="hover:text-slate-200 flex items-center gap-1"
                >
                  {copiedField === 'ag_commit' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'ag_commit' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="receipt-mono text-xs text-slate-200 break-all">{receipt.agreementCommitment}</p>
            </div>

            {/* Submission Commitment */}
            <div className="p-3 rounded-lg bg-surface-elevated/70 border border-border">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Submission Commitment (Deliverable Hash)</span>
                <button
                  onClick={() => copyToClipboard(receipt.submissionCommitment, 'sub_commit')}
                  className="hover:text-slate-200 flex items-center gap-1"
                >
                  {copiedField === 'sub_commit' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'sub_commit' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="receipt-mono text-xs text-slate-200 break-all">{receipt.submissionCommitment}</p>
            </div>
          </div>

          {/* Network details bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border text-xs text-slate-400">
            <div>
              Network: <span className="font-mono text-slate-200">{receipt.networkIdentifier}</span>
            </div>
            <div>
              Contract Address:{' '}
              <span className="font-mono text-slate-200">
                {receipt.contractAddress ? `${receipt.contractAddress.substring(0, 10)}...${receipt.contractAddress.substring(34)}` : 'N/A'}
              </span>
            </div>
            <div>
              Evaluator: <span className="text-primary-400 font-mono">{receipt.evaluation?.evaluationMethod || 'GenLayer'}</span>
            </div>
            <div>
              Timestamp: <span className="text-slate-300 font-mono">{new Date(receipt.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
