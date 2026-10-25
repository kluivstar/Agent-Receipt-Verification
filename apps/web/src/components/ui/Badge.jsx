import React from 'react';
import { STATUS_COLORS } from '../../lib/constants.js';

export function Badge({ children, status, variant, className = '' }) {
  let colorClasses = 'bg-surface-elevated text-slate-300 border-border';
  if (status && STATUS_COLORS[status]) {
    colorClasses = STATUS_COLORS[status];
  } else if (variant === 'success') {
    colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  } else if (variant === 'danger') {
    colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  } else if (variant === 'warning') {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (variant === 'primary') {
    colorClasses = 'bg-primary-500/10 text-primary-400 border-primary-500/20';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}>
      {children || status}
    </span>
  );
}
