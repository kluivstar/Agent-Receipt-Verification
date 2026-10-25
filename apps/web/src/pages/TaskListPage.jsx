import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, ArrowRight, CheckSquare, Calendar, User } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { api } from '../lib/api.js';

export function TaskListPage() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter) params.status = statusFilter;
      const res = await api.listTasks(params);
      setTasks(res.data);
    } catch (err) {
      console.error('Failed to list tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const statuses = [
    { id: '', label: 'All Statuses' },
    { id: 'OPEN', label: 'Open' },
    { id: 'SUBMITTED', label: 'Submitted' },
    { id: 'EVALUATING', label: 'Evaluating' },
    { id: 'ACCEPTED', label: 'Accepted' },
    { id: 'REJECTED', label: 'Rejected' },
    { id: 'NEEDS_REVIEW', label: 'Needs Review' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Agent Tasks</h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered tasks, acceptance criteria agreements, and live verification states.
          </p>
        </div>
        <Link to="/app/tasks/new">
          <Button icon={Plus}>Create Task</Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by task title, description, or ID..."
            className="w-full pl-10 pr-4 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => setStatusFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-elevated text-slate-400 hover:text-slate-200 border border-border'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton count={4} />
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No tasks match criteria"
              description={search || statusFilter ? 'Try clearing your filters.' : 'Create your first task to get started.'}
              actionText={search || statusFilter ? 'Clear Filters' : 'Create Task'}
              onAction={() => {
                if (search || statusFilter) {
                  setSearch('');
                  setStatusFilter('');
                } else {
                  window.location.href = '/app/tasks/new';
                }
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/40 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6">Task Title & ID</th>
                    <th className="py-3 px-6">Requester / Assigned</th>
                    <th className="py-3 px-6">Deliverable Type</th>
                    <th className="py-3 px-6">Criteria Count</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-surface-elevated/30 transition-colors">
                      <td className="py-4 px-6 max-w-sm">
                        <Link to={`/app/tasks/${task.id}`} className="font-semibold text-slate-100 hover:text-primary-400 transition-colors block truncate">
                          {task.title}
                        </Link>
                        <span className="receipt-mono text-xs text-slate-400">
                          {task.id}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-300">
                        <div className="truncate max-w-[140px] font-mono">
                          {task.requester}
                        </div>
                        {task.assignedAgent && (
                          <div className="text-slate-400 truncate max-w-[140px] font-mono text-[11px]">
                            → {task.assignedAgent}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        <span className="px-2 py-0.5 rounded bg-surface-elevated border border-border">
                          {task.deliverableType}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs font-mono text-slate-300">
                        {task.acceptanceCriteria?.length || 0} criteria
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <Badge status={task.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link to={`/app/tasks/${task.id}`}>
                          <Button variant="ghost" size="sm" icon={ArrowRight}>
                            Inspect
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
