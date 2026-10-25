import React from 'react';
import { Button } from './Button.jsx';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) {
  return (
    <div className={`text-center py-12 px-4 rounded-xl border border-dashed border-border bg-surface-subtle/40 ${className}`}>
      {Icon && (
        <div className="w-12 h-12 mx-auto rounded-full bg-surface-elevated flex items-center justify-center text-slate-400 mb-4 border border-border">
          <Icon className="w-6 h-6 text-slate-300" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
