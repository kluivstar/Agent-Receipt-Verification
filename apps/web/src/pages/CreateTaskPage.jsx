import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, ShieldCheck, AlertCircle, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { api } from '../lib/api.js';
import { DELIVERABLE_TYPES } from '@agentreceipt/shared';

export function CreateTaskPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requester: '0xAgentRequester_Alpha89',
    assignedAgent: '',
    deliverableType: 'URL_REPORT',
    deliverableInstructions: '',
    evidenceRequirements: '',
    deadline: '',
    acceptanceCriteria: [
      {
        id: 'crit_' + Math.random().toString(36).substring(2, 7),
        title: '',
        description: '',
        passCondition: '',
        weight: 2,
        required: true
      }
    ]
  });

  const handleAddCriterion = () => {
    setFormData((prev) => ({
      ...prev,
      acceptanceCriteria: [
        ...prev.acceptanceCriteria,
        {
          id: 'crit_' + Math.random().toString(36).substring(2, 7),
          title: '',
          description: '',
          passCondition: '',
          weight: 1,
          required: true
        }
      ]
    }));
  };

  const handleRemoveCriterion = (index) => {
    if (formData.acceptanceCriteria.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      acceptanceCriteria: prev.acceptanceCriteria.filter((_, idx) => idx !== index)
    }));
  };

  const handleCriterionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.acceptanceCriteria];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, acceptanceCriteria: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('Task description must be at least 10 characters.');
      return;
    }
    if (formData.acceptanceCriteria.some(c => !c.title.trim() || !c.passCondition.trim())) {
      setError('Every acceptance criterion must have a title and pass condition.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        assignedAgent: formData.assignedAgent.trim() || null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      const res = await api.createTask(payload);
      navigate(`/app/tasks/${res.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Back button and page header */}
      <div className="flex items-center gap-4">
        <Link to="/app/tasks">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Agent Task</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Define verifiable acceptance criteria for autonomous agent execution.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Validation Error</p>
            <p className="text-xs text-rose-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Overview */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>1. Task Overview</CardTitle>
              <CardDescription>Basic identifiers and high-level scope</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Task Title"
              required
              placeholder="e.g. Multi-Cloud LLM Inference Benchmark"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <Textarea
              label="Detailed Task Description"
              required
              rows={3}
              placeholder="Describe the context, domain, and objective of this task..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Requester Identifier / Address"
                required
                value={formData.requester}
                onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
              />

              <Input
                label="Assigned Agent (Optional)"
                placeholder="Leave blank for any agent, or specify agent ID"
                value={formData.assignedAgent}
                onChange={(e) => setFormData({ ...formData, assignedAgent: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* SECTION 2: Deliverable Specifications */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>2. Deliverable Specifications</CardTitle>
              <CardDescription>Format instructions and submission deadline</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Deliverable Type <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.deliverableType}
                  onChange={(e) => setFormData({ ...formData, deliverableType: e.target.value })}
                  className="w-full px-3.5 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  {DELIVERABLE_TYPES.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Submission Deadline (Optional)"
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <Textarea
              label="Deliverable Instructions"
              required
              rows={3}
              placeholder="Explain how the deliverable should be structured (e.g. include markdown report, JSON distribution charts, etc.)..."
              value={formData.deliverableInstructions}
              onChange={(e) => setFormData({ ...formData, deliverableInstructions: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* SECTION 3: Acceptance Criteria */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>3. Acceptance Criteria Agreement</CardTitle>
              <CardDescription>
                Criteria must be specific, observable, and agreed upon before deliverable submission.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleAddCriterion}
            >
              Add Criterion
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-surface-elevated/60 border border-border flex items-start gap-2.5 text-xs text-slate-400">
              <Info className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
              <p>
                Each criterion will be bound into an immutable cryptographic hash (<code className="text-slate-300">agreementCommitment</code>) before submission. GenLayer validators adjudicate against these exact conditions.
              </p>
            </div>

            <div className="space-y-4">
              {formData.acceptanceCriteria.map((criterion, idx) => (
                <div
                  key={criterion.id || idx}
                  className="p-4 rounded-xl bg-surface-elevated border border-border space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary-400 uppercase tracking-wider font-mono">
                      Criterion #{idx + 1}
                    </span>
                    {formData.acceptanceCriteria.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                        title="Remove criterion"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Input
                        label="Criterion Title"
                        required
                        placeholder="e.g. p95 Latency Threshold"
                        value={criterion.title}
                        onChange={(e) => handleCriterionChange(idx, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Weight (1-10)"
                        type="number"
                        min="1"
                        max="10"
                        value={criterion.weight}
                        onChange={(e) => handleCriterionChange(idx, 'weight', parseInt(e.target.value, 10) || 1)}
                      />
                    </div>
                  </div>

                  <Input
                    label="Description & Context"
                    placeholder="e.g. Response time must be measured under a 1k token workload across 500 requests."
                    value={criterion.description}
                    onChange={(e) => handleCriterionChange(idx, 'description', e.target.value)}
                  />

                  <Input
                    label="Explicit Pass Condition"
                    required
                    placeholder="e.g. p95 latency <= 60ms verified in benchmark logs."
                    value={criterion.passCondition}
                    onChange={(e) => handleCriterionChange(idx, 'passCondition', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 4: Evidence Requirements */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>4. Evidence Requirements</CardTitle>
              <CardDescription>
                State which supporting files, URLs, or artifacts must accompany the submission
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              label="Required Supporting Evidence"
              required
              rows={3}
              placeholder="e.g. Raw JSON latency logs, public contractual SLA document link, and ping traceroutes from 3 global nodes."
              value={formData.evidenceRequirements}
              onChange={(e) => setFormData({ ...formData, evidenceRequirements: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to="/app/tasks">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            icon={ShieldCheck}
          >
            Create Task & Anchor Agreement
          </Button>
        </div>
      </form>
    </div>
  );
}
