import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  FileCheck2,
  FileCode2,
  Sliders,
  ExternalLink,
  ShieldAlert,
  Terminal
} from 'lucide-react';

export function Sidebar() {
  const navItems = [
    { to: '/app', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/app/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/app/receipts', label: 'Receipts', icon: FileCheck2 },
    { to: '/app/contract', label: 'Contract & Network', icon: Terminal },
    { to: '/app/settings', label: 'Settings & Demo', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-border bg-surface-subtle flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Quick Guide Box */}
        <div className="p-3.5 rounded-lg bg-surface-elevated/70 border border-border space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <FileCode2 className="w-3.5 h-3.5 text-primary-400" />
            <span>GenVM Protocol</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Every receipt uses an Intelligent Contract equivalence principle to adjudicate deliverables against pre-committed criteria.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Engine</span>
          <span className="font-mono text-slate-300">GenLayer v1.2</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Mode</span>
          <span className="text-amber-400 font-mono">Demo / Sim</span>
        </div>
      </div>
    </aside>
  );
}
