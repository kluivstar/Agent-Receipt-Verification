import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck2,
  ArrowRight,
  Shield,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { api } from '../lib/api.js';

export function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const [mRes, tRes, rRes] = await Promise.all([
          api.getMetrics(),
          api.listTasks({ limit: 5 }),
          api.listReceipts({ limit: 5 })
        ]);
        setMetrics(mRes.data);
        setRecentTasks(tRes.data);
        setRecentReceipts(rRes.data);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface-elevated animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Protocol Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of agent commitments, intelligent contract evaluations, and verification receipts.
          </p>
        </div>
        <Link to="/app/tasks/new">
          <Button icon={Plus}>Create Task</Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Tasks */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Tasks Created</span>
            <CheckSquare className="w-4 h-4 text-primary-400" />
          </div>
          <p className="text-2xl font-bold text-white">{metrics?.total || 0}</p>
          <span className="text-[11px] text-slate-400 font-mono">Off-chain commitments</span>
        </div>

        {/* Pending Evaluations */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending / In Review</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">
            {(metrics?.SUBMITTED || 0) + (metrics?.EVALUATING || 0) + (metrics?.NEEDS_REVIEW || 0)}
          </p>
          <span className="text-[11px] text-slate-400 font-mono">Awaiting adjudication</span>
        </div>

        {/* Verified / Accepted */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Verified Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{metrics?.ACCEPTED || 0}</p>
          <span className="text-[11px] text-slate-400 font-mono">100% criteria passed</span>
        </div>

        {/* Rejected Tasks */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Rejected Tasks</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400">{metrics?.REJECTED || 0}</p>
          <span className="text-[11px] text-slate-400 font-mono">Failed pass condition</span>
        </div>

        {/* Total Receipts */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Audit Receipts</span>
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-400">{metrics?.totalReceipts || 0}</p>
          <span className="text-[11px] text-slate-400 font-mono">Auditable proofs</span>
        </div>
      </div>

      {/* Grid of Recent Tasks and Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-primary-400" />
              <CardTitle>Recent Agent Tasks</CardTitle>
            </div>
            <Link to="/app/tasks" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentTasks.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title="No tasks found"
                description="Create your first agent task with explicit acceptance criteria."
                actionText="Create Task"
                onAction={() => window.location.href = '/app/tasks/new'}
              />
            ) : (
              <div className="divide-y divide-border">
                {recentTasks.map((t) => (
                  <Link
                    key={t.id}
                    to={`/app/tasks/${t.id}`}
                    className="p-4 flex items-center justify-between hover:bg-surface-elevated/40 transition-colors block"
                  >
                    <div className="space-y-1 max-w-[70%]">
                      <p className="text-sm font-semibold text-slate-200 truncate">{t.title}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="receipt-mono">{t.id}</span>
                        <span>•</span>
                        <span>{t.acceptanceCriteria?.length || 0} criteria</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge status={t.status} />
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Receipts */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-primary-400" />
              <CardTitle>Recent Verification Receipts</CardTitle>
            </div>
            <Link to="/app/receipts" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentReceipts.length === 0 ? (
              <EmptyState
                icon={FileCheck2}
                title="No receipts generated"
                description="Completed evaluations will record verification receipts here."
              />
            ) : (
              <div className="divide-y divide-border">
                {recentReceipts.map((r) => (
                  <Link
                    key={r.id}
                    to={`/app/receipts/${r.id}`}
                    className="p-4 flex items-center justify-between hover:bg-surface-elevated/40 transition-colors block"
                  >
                    <div className="space-y-1 max-w-[70%]">
                      <p className="text-sm font-mono text-slate-200 truncate">{r.id}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Task: {r.taskId}</span>
                        <span>•</span>
                        <span className="font-mono text-[10px] truncate max-w-[120px]">
                          {r.transactionHash ? `${r.transactionHash.substring(0, 8)}...` : 'Simulated'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          r.decision === 'ACCEPTED'
                            ? 'success'
                            : r.decision === 'REJECTED'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {r.decision}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
