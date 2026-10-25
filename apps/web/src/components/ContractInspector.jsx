import React, { useState, useEffect } from 'react';
import { Terminal, Shield, CheckCircle2, Copy, Check, ExternalLink, Code2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card.jsx';
import { Button } from './ui/Button.jsx';
import { api } from '../lib/api.js';

export function ContractInspector() {
  const [networkConfig, setNetworkConfig] = useState(null);
  const [queryType, setQueryType] = useState('task');
  const [queryId, setQueryId] = useState('tsk_vendor_bench_01');
  const [queryResult, setQueryResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getNetworkConfig().then(res => setNetworkConfig(res.data)).catch(console.error);
  }, []);

  const handleQuery = async () => {
    setIsLoading(true);
    setQueryResult(null);
    try {
      if (queryType === 'task') {
        const res = await api.getTask(queryId);
        setQueryResult(res.data);
      } else if (queryType === 'receipt') {
        const res = await api.getReceipt(queryId);
        setQueryResult(res.data);
      }
    } catch (err) {
      setQueryResult({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const pythonContractCode = `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class AgentReceiptVerifier(gl.Contract):
    """
    AgentReceiptVerifier: GenLayer Intelligent Contract for AI Agent Tasks.
    Adjudicates deliverables using decentralized LLM equivalence principle.
    """
    owner: Address
    tasks: dict[str, dict]
    submissions: dict[str, dict]
    evaluations: dict[str, dict]
    receipts: dict[str, dict]

    @gl.public.write
    def register_task(self, task_id: str, title: str, requester: Address, ...):
        # Enforces immutable agreement commitment before deliverable submission
        assert task_id not in self.tasks, "Task already registered"
        ...

    @gl.public.write
    def evaluate_submission(self, task_id: str, submission_id: str) -> str:
        # Non-deterministic LLM evaluation inside GenLayer equivalence principle
        def run_assessment():
            prompt = f"Evaluate deliverable against criteria..."
            return gl.nondet.exec_prompt(prompt, response_format="json")

        # Decentralized equivalence consensus across network validators
        result_json = gl.eq_principle.prompt_non_comparative(
            run_assessment,
            criteria="Validators must agree on whether required criteria passed."
        )
        ...`;

  return (
    <div className="space-y-6">
      {/* Network Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary-400" />
            <CardTitle>GenLayer Intelligent Contract & Network State</CardTitle>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Connected: {networkConfig?.network || 'studionet'}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-surface-elevated border border-border">
              <span className="text-slate-400">Chain ID</span>
              <p className="text-base font-semibold text-slate-100 font-mono mt-0.5">
                {networkConfig?.chainId || 61999}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated border border-border">
              <span className="text-slate-400">RPC Endpoint</span>
              <p className="text-xs text-slate-200 font-mono mt-1 truncate">
                {networkConfig?.rpcUrl || 'https://studio.genlayer.com/api'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-elevated border border-border">
              <span className="text-slate-400">Contract Address</span>
              <p className="text-xs text-slate-200 font-mono mt-1 truncate">
                {networkConfig?.contractAddress || '0x71C841961e564d26270E455d36e2fFeD97b98218'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Query Tool */}
      <Card>
        <CardHeader>
          <CardTitle>Direct Contract State Query (View Methods)</CardTitle>
          <span className="text-xs text-slate-400">Read on-chain / local records</span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={queryType}
              onChange={(e) => setQueryType(e.target.value)}
              className="px-3 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="task">get_task(task_id)</option>
              <option value="receipt">get_receipt(receipt_id)</option>
            </select>
            <input
              type="text"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Identifier (e.g. tsk_vendor_bench_01)"
              className="flex-1 px-3.5 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <Button onClick={handleQuery} isLoading={isLoading}>
              Query State
            </Button>
          </div>

          {queryResult && (
            <div className="p-4 rounded-lg bg-surface-elevated border border-border overflow-x-auto">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Result Decoded</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(queryResult, null, 2));
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="hover:text-slate-200 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                {JSON.stringify(queryResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Python Contract Architecture Code Box */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-primary-400" />
            <CardTitle>Intelligent Contract Implementation (Python)</CardTitle>
          </div>
          <span className="text-xs text-slate-400">GenVM Equivalence Principle Sandbox</span>
        </CardHeader>
        <CardContent>
          <pre className="p-4 rounded-lg bg-surface-elevated border border-border text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
            {pythonContractCode}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
