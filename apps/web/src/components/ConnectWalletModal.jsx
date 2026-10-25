import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  RefreshCw,
  Globe,
  ShieldAlert
} from 'lucide-react';
import { Modal } from './ui/Modal.jsx';
import { Button } from './ui/Button.jsx';
import { Badge } from './ui/Badge.jsx';
import { walletService } from '../lib/wallet.js';

export function ConnectWalletModal({
  isOpen,
  onClose,
  walletState,
  setWalletState
}) {
  const [hasInjected, setHasInjected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHasInjected(walletService.hasInjectedWallet());
  }, [isOpen]);

  const handleConnectInjected = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await walletService.connectInjectedWallet();
      setWalletState({
        address: result.address,
        chainId: result.chainId,
        isSimulated: false
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to connect browser wallet.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectSimulated = () => {
    setWalletState({
      address: '0xAgentRequester_Alpha89',
      chainId: 61999,
      isSimulated: true
    });
    setError(null);
    onClose();
  };

  const handleSwitchNetwork = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await walletService.switchOrAddGenLayerNetwork();
      setWalletState(prev => ({ ...prev, chainId: 61999 }));
    } catch (err) {
      setError(err.message || 'Failed to switch network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setWalletState({
      address: null,
      chainId: null,
      isSimulated: false
    });
    onClose();
  };

  const copyAddress = () => {
    if (walletState?.address) {
      navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isConnected = Boolean(walletState?.address);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isConnected ? 'Connected Wallet' : 'Connect Wallet'}
      description={
        isConnected
          ? 'Manage your active Web3 wallet connection and network.'
          : 'Connect an actual browser extension wallet or use simulated agent testing.'
      }
      maxWidth="max-w-md"
    >
      <div className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-rose-400 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {isConnected ? (
          // ALREADY CONNECTED VIEW
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-elevated border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Active Address</span>
                <Badge variant={walletState.isSimulated ? 'warning' : 'success'}>
                  {walletState.isSimulated ? 'Simulated Local Agent' : 'Live Web3 Wallet'}
                </Badge>
              </div>

              <div className="flex items-center justify-between gap-2 p-2.5 rounded bg-background/80 border border-border font-mono text-xs text-slate-200">
                <span className="truncate">{walletState.address}</span>
                <button
                  onClick={copyAddress}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Chain ID</span>
                <span className="font-mono text-slate-300">
                  {walletState.chainId ? `${walletState.chainId} (${walletState.chainId === 61999 ? 'GenLayer StudioNet' : 'Other Network'})` : 'Unknown'}
                </span>
              </div>
            </div>

            {/* Switch network action if not on GenLayer StudioNet */}
            {!walletState.isSimulated && walletState.chainId !== 61999 && (
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
                  <Globe className="w-4 h-4" />
                  <span>Different Network Detected</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your wallet is currently on chain {walletState.chainId}. Switch to GenLayer StudioNet to interact with Intelligent Contracts.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={handleSwitchNetwork}
                  isLoading={isLoading}
                >
                  Switch to GenLayer StudioNet
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={LogOut}
                onClick={handleDisconnect}
                className="text-rose-400 hover:text-rose-300 border-rose-500/20 hover:border-rose-500/40"
              >
                Disconnect
              </Button>
              <Button variant="secondary" size="sm" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          // NOT CONNECTED VIEW - SELECTION OPTIONS
          <div className="space-y-3">
            {/* Real Web3 Browser Wallet Button */}
            <button
              onClick={handleConnectInjected}
              disabled={isLoading}
              className="w-full p-4 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border hover:border-primary-500/50 transition-all text-left flex items-start gap-3.5 group disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center shrink-0 group-hover:border-primary-500/40 transition-colors">
                <Wallet className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-100 group-hover:text-primary-400 transition-colors">
                    Browser Extension Wallet
                  </span>
                  {hasInjected && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Detected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {hasInjected
                    ? 'Connect via MetaMask, Rabby, Coinbase Wallet, or Brave.'
                    : 'No browser wallet detected. Click to prompt extension or choose demo below.'}
                </p>
              </div>
            </button>

            {/* Simulated Demo Agent Wallet Option */}
            <button
              onClick={handleConnectSimulated}
              disabled={isLoading}
              className="w-full p-4 rounded-xl bg-surface-elevated/60 hover:bg-surface-hover border border-dashed border-border hover:border-slate-600 transition-all text-left flex items-start gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-lg bg-surface border border-border text-slate-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">
                    Simulated Agent Wallet (Demo)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Local Testing
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Instant local testing with an ephemeral mock agent address. No browser extension or testnet gas required.
                </p>
              </div>
            </button>

            {!hasInjected && (
              <div className="p-3 rounded-lg bg-surface border border-border text-xs text-slate-400 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  To interact with live GenLayer Intelligent Contracts on-chain, install{' '}
                  <a
                    href="https://metamask.io"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-400 hover:underline"
                  >
                    MetaMask
                  </a>{' '}
                  or{' '}
                  <a
                    href="https://rabby.io"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-400 hover:underline"
                  >
                    Rabby
                  </a>
                  .
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
