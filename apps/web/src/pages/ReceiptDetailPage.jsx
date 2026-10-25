import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileCheck2, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button.jsx';
import { ReceiptViewer } from '../components/ReceiptViewer.jsx';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { api } from '../lib/api.js';

export function ReceiptDetailPage() {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReceipt = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.getReceipt(id);
      setReceipt(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load receipt.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        <div className="h-6 w-32 bg-surface-elevated animate-pulse rounded" />
        <LoadingSkeleton count={4} />
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-4">
        <p className="text-rose-400 font-semibold">{error || `Receipt '${id}' not found`}</p>
        <Link to="/app/receipts">
          <Button variant="secondary" icon={ArrowLeft}>
            Back to Receipts
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top back nav */}
      <div className="flex items-center justify-between">
        <Link to="/app/receipts">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            All Receipts
          </Button>
        </Link>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Task ID:</span>
          <Link to={`/app/tasks/${receipt.taskId}`} className="font-mono text-primary-400 hover:underline">
            {receipt.taskId}
          </Link>
        </div>
      </div>

      {/* Main Full Receipt Card */}
      <ReceiptViewer receipt={receipt} onRefresh={fetchReceipt} />
    </div>
  );
}
