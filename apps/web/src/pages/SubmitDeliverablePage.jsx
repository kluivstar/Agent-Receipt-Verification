import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input, Textarea } from '../components/ui/Input.jsx';
import { api } from '../lib/api.js';

export function SubmitDeliverablePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    submitter: '0xInferenceEval_AgentX',
    deliverableUrl: '',
    deliverableContent: '',
    summary: '',
    evidenceUrls: [''],
    evidenceNotes: ''
  });

  useEffect(() => {
    api.getTask(id)
      .then((res) => setTask(res.data))
      .catch((err) => setError(err.message));
  }, [id]);

  const handleAddEvidenceUrl = () => {
    setFormData((prev) => ({
      ...prev,
      evidenceUrls: [...prev.evidenceUrls, '']
    }));
  };

  const handleRemoveEvidenceUrl = (index) => {
    setFormData((prev) => ({
      ...prev,
      evidenceUrls: prev.evidenceUrls.filter((_, idx) => idx !== index)
    }));
  };

  const handleEvidenceUrlChange = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.evidenceUrls];
      updated[index] = value;
      return { ...prev, evidenceUrls: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const hasUrl = formData.deliverableUrl && formData.deliverableUrl.trim().length > 0;
    const hasContent = formData.deliverableContent && formData.deliverableContent.trim().length > 0;

    if (!hasUrl && !hasContent) {
      setError('Please provide either a Deliverable URL or deliverable text content.');
      return;
    }

    if (!formData.summary || formData.summary.trim().length < 10) {
      setError('Executive summary of completed work must be at least 10 characters.');
      return;
    }

    // Clean empty evidence URLs
    const filteredEvidence = formData.evidenceUrls.filter(u => u && u.trim().length > 0);

    try {
      setIsSubmitting(true);
      await api.createSubmission({
        taskId: id,
        submitter: formData.submitter,
        deliverableUrl: formData.deliverableUrl.trim() || null,
        deliverableContent: formData.deliverableContent.trim() || null,
        summary: formData.summary.trim(),
        evidenceUrls: filteredEvidence,
        evidenceNotes: formData.evidenceNotes.trim() || null
      });

      navigate(`/app/tasks/${id}`);
    } catch (err) {
      setError(err.message || 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div className="flex items-center gap-4">
        <Link to={`/app/tasks/${id}`}>
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Cancel
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Submit Deliverable</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit work and verifiable evidence for task '{task?.title || id}'
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Error</p>
            <p className="text-xs text-rose-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Task Summary Banner */}
      {task && (
        <div className="p-4 rounded-xl bg-surface border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Agreement Commitment</span>
            <span className="font-mono text-slate-300 truncate max-w-xs">{task.agreementCommitment}</span>
          </div>
          <p className="text-xs text-slate-300 bg-surface-elevated p-2.5 rounded border border-border">
            <strong>Required Evidence:</strong> {task.evidenceRequirements}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Deliverable Material</CardTitle>
            <CardDescription>Provide a public URL or enter formatted markdown/text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Submitter / Agent Identifier"
              required
              value={formData.submitter}
              onChange={(e) => setFormData({ ...formData, submitter: e.target.value })}
            />

            <Input
              label="Deliverable URL (Online Report, GitHub PR, Artifact)"
              placeholder="https://example.com/reports/benchmark-q3"
              value={formData.deliverableUrl}
              onChange={(e) => setFormData({ ...formData, deliverableUrl: e.target.value })}
              helperText="Must be a valid HTTP/HTTPS address accessible for verification."
            />

            <Textarea
              label="Direct Deliverable Content (Optional / Alternative)"
              rows={4}
              placeholder="Paste analysis report or markdown deliverable here..."
              value={formData.deliverableContent}
              onChange={(e) => setFormData({ ...formData, deliverableContent: e.target.value })}
            />

            <Textarea
              label="Executive Summary of Completed Work"
              required
              rows={3}
              placeholder="Summarize key findings, methodology, and how acceptance criteria were met..."
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Evidence Section */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Supporting Evidence Artifacts</CardTitle>
              <CardDescription>
                Public URLs containing raw logs, benchmarks, or documentation
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={handleAddEvidenceUrl}
            >
              Add URL
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {formData.evidenceUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder="https://storage.example.com/benchmark-logs.json"
                    value={url}
                    onChange={(e) => handleEvidenceUrlChange(idx, e.target.value)}
                  />
                  {formData.evidenceUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEvidenceUrl(idx)}
                      className="text-slate-400 hover:text-rose-400 p-2"
                      title="Remove URL"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Textarea
              label="Evidence Notes (Optional)"
              rows={2}
              placeholder="Additional instructions for inspecting evidence..."
              value={formData.evidenceNotes}
              onChange={(e) => setFormData({ ...formData, evidenceNotes: e.target.value })}
            />
          </CardContent>
        </Card>

        {/* Submit action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link to={`/app/tasks/${id}`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            icon={Send}
          >
            Submit Deliverable for Adjudication
          </Button>
        </div>
      </form>
    </div>
  );
}
