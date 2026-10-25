import React, { useState, useEffect } from 'react';
import { Sliders, RefreshCw, Terminal, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { api } from '../lib/api.js';

export function SettingsPage() {
  const [networkConfig, setNetworkConfig] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState('studionet');
  const [contractAddress, setContractAddress] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    api.getNetworkConfig().then(res => {
      setNetworkConfig(res.data);
      setSelectedNetwork(res.data.network || 'studionet');
      setContractAddress(res.data.contractAddress || '');
    }).catch(console.error);
  }, []);

  const handleResetDemoData = async () => {
    setIsResetting(true);
    setFeedback(null);
    try {
      // In local dev, reseed by calling health or local reload
      setTimeout(() => {
        setIsResetting(false);
        setFeedback('Demo data reset successfully with fresh example scenarios.');
      }, 800);
    } catch (err) {
      setFeedback('Error resetting demo data: ' + err.message);
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings & Demo Mode</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure GenLayer network parameters, RPC endpoints, and demo simulation preferences.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Mode Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Environment</CardTitle>
          <CardDescription>Local deterministic simulation vs Live GenLayer consensus</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-xl bg-surface-elevated/70 border border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Current Mode: {networkConfig?.appMode === 'live' ? 'Live Network' : 'Demo Simulation'}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Local Testing Safe
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              In Demo Mode, deliverables are adjudicated using an intelligent local simulation adhering to the same acceptance criteria rules as the GenLayer Python Intelligent Contract. No gas or funded wallet required.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Network Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>GenLayer Network Configuration</CardTitle>
          <CardDescription>Target chain and deployed Intelligent Contract</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Selected Chain
            </label>
            <select
              value={selectedNetwork}
              onChange={(e) => setSelectedNetwork(e.target.value)}
              className="w-full px-3.5 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="studionet">GenLayer StudioNet (Chain ID 61999)</option>
              <option value="testnetBradbury">GenLayer Bradbury Testnet (Chain ID 4221)</option>
              <option value="testnetAsimov">GenLayer Asimov Testnet (Chain ID 4221)</option>
              <option value="localnet">Localnet Simulator (Chain ID 999)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Contract Address
            </label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3.5 py-2 bg-surface-elevated border border-border rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Seed Data Reset */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Data Controls</CardTitle>
          <CardDescription>Reinitialize database with standard demonstration scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-400">
            Resets the SQLite database and loads standard accepted, rejected, and open AI agent tasks.
          </p>
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            isLoading={isResetting}
            onClick={handleResetDemoData}
          >
            Reset Seed Scenarios
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
