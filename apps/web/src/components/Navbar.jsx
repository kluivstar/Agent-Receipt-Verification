import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Wallet, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button.jsx';
import { ConnectWalletModal } from './ConnectWalletModal.jsx';
import { api } from '../lib/api.js';
import { walletService } from '../lib/wallet.js';

export function Navbar({ walletState, setWalletState }) {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api.getNetworkConfig()
      .then(res => setNetworkInfo(res.data))
      .catch(() => setNetworkInfo({ network: 'studionet', appMode: 'demo', isConfigured: false }));
  }, []);

  // Listen to EIP-1193 wallet account/network changes
  useEffect(() => {
    const unsubscribe = walletService.subscribeToEvents({
      onAccountsChanged: (account) => {
        if (!account) {
          setWalletState({ address: null, chainId: null, isSimulated: false });
        } else {
          setWalletState(prev => ({ ...prev, address: account, isSimulated: false }));
        }
      },
      onChainChanged: (chainId) => {
        setWalletState(prev => ({ ...prev, chainId }));
      }
    });

    return unsubscribe;
  }, [setWalletState]);

  const isLanding = location.pathname === '/';
  const isConnected = Boolean(walletState?.address);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-400 group-hover:border-primary-400 transition-colors shadow-sm">
              <ShieldCheck className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                AgentReceipt
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary-500/10 text-primary-400 border border-primary-500/20">
                  GenLayer
                </span>
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline -mt-0.5">
                Verifiable Agent Protocol
              </span>
            </div>
          </Link>

          {isLanding && (
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
              <a href="#benefits" className="hover:text-slate-200 transition-colors">Protocol</a>
              <a href="#how-it-works" className="hover:text-slate-200 transition-colors">How It Works</a>
              <a href="#developer" className="hover:text-slate-200 transition-colors">Developers</a>
              <Link to="/app" className="hover:text-slate-200 transition-colors">App Dashboard</Link>
            </nav>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Network Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated border border-border text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">
              {networkInfo?.chainName || 'GenLayer StudioNet'}
            </span>
            <span className="text-[10px] uppercase font-mono px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {networkInfo?.appMode === 'live' ? 'Live Consensus' : 'Demo Mode'}
            </span>
          </div>

          {/* Connect / Active Wallet Button */}
          <Button
            variant={isConnected ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setIsWalletModalOpen(true)}
            icon={isConnected ? (walletState.isSimulated ? Wallet : CheckCircle2) : Wallet}
            className={isConnected ? 'receipt-mono text-xs' : ''}
          >
            {isConnected ? (
              <span className="receipt-mono truncate max-w-[130px] flex items-center gap-1">
                {walletState.address.substring(0, 6)}...{walletState.address.substring(walletState.address.length - 4)}
                {walletState.isSimulated && (
                  <span className="text-[9px] text-amber-400 uppercase font-sans font-normal ml-0.5">(Demo)</span>
                )}
              </span>
            ) : (
              'Connect Wallet'
            )}
          </Button>

          {!isLanding && (
            <Link to="/app/tasks/new">
              <Button size="sm" variant="primary">
                + Create Task
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletState={walletState}
        setWalletState={setWalletState}
      />
    </header>
  );
}
