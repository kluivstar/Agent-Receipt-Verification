import React from 'react';

export function LoadingSkeleton({ count = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-20 bg-surface-elevated/60 animate-pulse rounded-lg border border-border/40"
        />
      ))}
    </div>
  );
}
