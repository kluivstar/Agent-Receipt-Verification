import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckSquare,
  Clock,
  User,
  ShieldCheck,
  FileCheck2,
  Send,
  Cpu,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { api } from '../lib/api.js';

export function TaskDetailPage() {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalModalOpen, setEvalModalOpen] = useState(false);
  const [evalProgressText, setEvalProgressText] = useState('');
  const [evalMode, setEvalMode] = useState('demo');

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      const res = await api.getTask(id);
      setTask(res.data);
    } catch (err) {
      console.error('Failed to load task:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunEvaluation = async (submissionId) => {
    setIsEvaluating(true);
    setEvalModalOpen(true);
    setEvalProgressText('1/3: Reading agreement commitment and deliverable artifacts...');

    try {
      setTimeout(() => {
        setEvalProgressText('2/3: Dispatching to GenLayer Equivalence Principle Sandbox...');
      }, 900);

      setTimeout(() => {
        setEvalProgressText('3/3: Reaching validator consensus on acceptance criteria...');
      }, 1800);

      const res = await api.evaluateSubmission({
        submissionId,
        mode: evalMode,
        forceSimulation: evalMode === 'demo'
      });

      setTimeout(() => {
        setIsEvaluating(false);
        setEvalModalOpen(false);
        fetchTask();
      }, 2400);
    } catch (err) {
      alert('Evaluation failed: ' + err.message);
      setIsEvaluating(false);
      setEvalModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-surface-elevated animate-pulse rounded" />
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-400">Task '{id}' was not found.</p>
        <Link to="/app/tasks">
          <Button variant="secondary" icon={ArrowLeft}>Back to Task List</Button>
        </Link>
      </div>
    );
  }

  const isAccepted = task.status === 'ACCEPTED';
  const isCancelled = task.status === 'CANCELLED';
  const hasSubmissions = task.submissions && task.submissions.length > 0;
  const latestSubmission = hasSubmissions ? task.submissions[0] : null;
  const hasReceipt = Boolean(task.receipt);

  return (
    <div className="space-y-6 pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/app/tasks">
            <Button variant="outline" size="sm" icon={ArrowLeft}>
              Tasks
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="receipt-mono text-xs text-slate-400">{task.id}</span>
              <Badge status={task.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              {task.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!isAccepted && !isCancelled && (
            <Link to={`/app/tasks/${task.id}/submit`}>
              <Button size="sm" variant="secondary" icon={Send}>
                Submit Deliverable
              </Button>
            </Link>
          )}

          {hasSubmissions && !isAccepted && (
            <Button
              size="sm"
              variant="primary"
              icon={Cpu}
              onClick={() => handleRunEvaluation(latestSubmission.id)}
            >
              Evaluate Submission
            </Button>
          )}

          {hasReceipt && (
            <Link to={`/app/receipts/${task.receipt.id}`}>
              <Button size="sm" variant="primary" icon={FileCheck2}>
                View Receipt
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* State banner */}
      {isAccepted && (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3 text-sm text-emerald-300">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>This task has been adjudicated as <strong>ACCEPTED</strong> with a cryptographic receipt. Agreement is finalized.</span>
          </div>
          {hasReceipt && (
            <Link to={`/app/receipts/${task.receipt.id}`}>
              <Button size="sm" variant="secondary">View Receipt</Button>
            </Link>
          )}
        </div>
      )}

      {/* Grid: Agreement & Criteria vs Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Details & Criteria */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <Card>
            <CardHeader>
              <CardTitle>Task Agreement & Scope</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-300">
              <p className="leading-relaxed">{task.description}</p>

              <div className="pt-2 border-t border-border space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Deliverable Instructions ({task.deliverableType})
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-surface-elevated/70 p-3 rounded-lg border border-border">
                  {task.deliverableInstructions}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Evidence Requirements
                </span>
                <p className="text-xs text-slate-300 leading-relaxed bg-surface-elevated/70 p-3 rounded-lg border border-border">
                  {task.evidenceRequirements}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Structured Acceptance Criteria */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary-400" />
                <CardTitle>Agreed Acceptance Criteria ({task.acceptanceCriteria?.length || 0})</CardTitle>
              </div>
              <span className="text-xs text-slate-400">Pre-committed agreement</span>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {task.acceptanceCriteria?.map((criterion, idx) => (
                <div
                  key={criterion.id || idx}
                  className="p-4 rounded-xl bg-surface-elevated/80 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-200">
                      {idx + 1}. {criterion.title}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20">
                      Weight: {criterion.weight || 1}
                    </span>
                  </div>

                  {criterion.description && (
                    <p className="text-xs text-slate-400">{criterion.description}</p>
                  )}

                  <div className="pt-1.5 flex items-start gap-2 text-xs">
                    <span className="text-emerald-400 font-medium shrink-0">Pass Condition:</span>
                    <span className="text-slate-200 font-mono text-[11px] bg-background/60 px-2 py-1 rounded border border-border flex-1">
                      {criterion.passCondition}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Submissions History */}
          <Card>
            <CardHeader>
              <CardTitle>Deliverable Submissions ({task.submissions?.length || 0})</CardTitle>
              {!isAccepted && !isCancelled && (
                <Link to={`/app/tasks/${task.id}/submit`}>
                  <Button size="sm" variant="secondary" icon={Send}>
                    + New Submission
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasSubmissions ? (
                <p className="text-xs text-slate-500 italic py-2">
                  No deliverables submitted yet. Use 'Submit Deliverable' to record work.
                </p>
              ) : (
                task.submissions.map((sub, sIdx) => (
                  <div
                    key={sub.id || sIdx}
                    className="p-4 rounded-xl bg-surface-elevated/70 border border-border space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <span className="receipt-mono text-xs font-semibold text-slate-200">{sub.id}</span>
                        <Badge status={sub.status} />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(sub.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 font-medium">Executive Summary</span>
                      <p className="text-xs text-slate-200 leading-relaxed">{sub.summary}</p>
                    </div>

                    {sub.deliverableUrl && (
                      <div className="text-xs">
                        <span className="text-slate-400">Deliverable URL: </span>
                        <a
                          href={sub.deliverableUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-400 hover:text-primary-300 underline font-mono inline-flex items-center gap-1"
                        >
                          {sub.deliverableUrl} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {sub.evidenceUrls && sub.evidenceUrls.length > 0 && (
                      <div className="text-xs space-y-1">
                        <span className="text-slate-400">Evidence Links ({sub.evidenceUrls.length}):</span>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {sub.evidenceUrls.map((ev, eIdx) => (
                            <li key={eIdx}>
                              <a
                                href={ev}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary-400 hover:text-primary-300 underline font-mono text-[11px]"
                              >
                                {ev}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!isAccepted && (
                      <div className="pt-2 flex justify-end">
                        <Button
                          size="sm"
                          variant="primary"
                          icon={Cpu}
                          onClick={() => handleRunEvaluation(sub.id)}
                        >
                          Adjudicate Submission
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 col): Metadata & Commitments */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agreement Commitment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Cryptographic Hash</span>
                <div className="p-2.5 rounded bg-surface-elevated border border-border flex items-center justify-between gap-2">
                  <span className="receipt-mono text-slate-200 break-all text-[11px]">
                    {task.agreementCommitment}
                  </span>
                  <button
                    onClick={() => copyToClipboard(task.agreementCommitment)}
                    className="p-1 hover:text-slate-200 text-slate-400"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-slate-400">Requester</span>
                  <span className="font-mono text-slate-200 truncate max-w-[140px]">{task.requester}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Agent</span>
                  <span className="font-mono text-slate-200 truncate max-w-[140px]">
                    {task.assignedAgent || 'Open to all'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deadline</span>
                  <span className="text-slate-200">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created At</span>
                  <span className="text-slate-200">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Link Card */}
          {hasReceipt && (
            <Card className="border-primary-500/30 bg-primary-950/10 glow-subtle">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-primary-400">
                  <FileCheck2 className="w-5 h-5" />
                  <span className="font-bold text-sm">Receipt Generated</span>
                </div>
                <p className="text-xs text-slate-300">
                  This task has an auditable receipt with full evaluation breakdown.
                </p>
                <Link to={`/app/receipts/${task.receipt.id}`} className="block">
                  <Button variant="primary" size="sm" className="w-full">
                    View Verification Receipt
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Evaluation Progress Modal */}
      <Modal
        isOpen={evalModalOpen}
        onClose={() => {}}
        title="GenLayer Intelligent Contract Adjudication"
        description="Executing decentralized consensus on acceptance criteria..."
      >
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary-600/20 border border-primary-500/50 flex items-center justify-center animate-spin">
            <Cpu className="w-7 h-7 text-primary-400" />
          </div>
          <p className="text-sm font-medium text-slate-200">{evalProgressText}</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Validators evaluate deliverable against original acceptance criteria commitments.
          </p>
        </div>
      </Modal>
    </div>
  );
}
