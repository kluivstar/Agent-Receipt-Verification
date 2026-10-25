import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileCheck2, ArrowRight, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { api } from '../lib/api.js';

export function ReceiptListPage() {
  const [receipts, setReceipts] = useState([]);
  const [decisionFilter, setDecisionFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchReceipts = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (decisionFilter) params.decision = decisionFilter;
      const res = await api.listReceipts(params);
      let list = res.data;
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter(r => r.id.toLowerCase().includes(q) || r.taskId.toLowerCase().includes(q));
      }
      setReceipts(list);
    } catch (err) {
      console.error('Failed to list receipts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [decisionFilter, search]);

  const decisionTabs = [
    { id: '', label: 'All Receipts' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'NEEDS_REVIEW', label: 'Needs Review' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Verification Receipts</h1>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically auditable records of agent deliverable evaluations produced by GenLayer Intelligent Contracts.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt ID or task ID..."
            className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {decisionTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDecisionFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                decisionFilter === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-elevated text-slate-400 hover:text-slate-200 border border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton count={4} />
            </div>
          ) : receipts.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No verification receipts found"
              description={decisionFilter || search ? 'Try resetting filters.' : 'Complete an adjudication on a task to generate a receipt.'}
              actionText="View Tasks"
              onAction={() => window.location.href = '/app/tasks'}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6">Receipt ID</th>
                    <th className="py-3 px-6">Task ID</th>
                    <th className="py-3 px-6">Decision</th>
                    <th className="py-3 px-6">Network</th>
                    <th className="py-3 px-6">Tx Hash / Execution</th>
                    <th className="py-3 px-6">Timestamp</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {receipts.map((r) => (
                    <tr key={r.id} className="hover:bg-surface-elevated/30 transition-colors">
                      <td className="py-4 px-6 whitespace-nowrap">
                        <Link to={`/app/receipts/${r.id}`} className="font-mono text-xs font-semibold text-primary-400 hover:underline">
                          {r.id}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-300 font-mono">
                        <Link to={`/app/tasks/${r.taskId}`} className="hover:text-primary-400">
                          {r.taskId}
                        </Link>
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
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
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-slate-400">
                        {r.networkIdentifier}
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-slate-400">
                        <span className="truncate max-w-[140px] block">
                          {r.transactionHash || 'Simulated'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link to={`/app/receipts/${r.id}`}>
                          <Button variant="ghost" size="sm" icon={ArrowRight}>
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
