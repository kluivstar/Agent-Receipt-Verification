export const STATUS_COLORS = {
  OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  ASSIGNED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  SUBMITTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  EVALUATING: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  ACCEPTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  REJECTED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  NEEDS_REVIEW: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  CONFIRMED_ON_CHAIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
};

export const DECISION_BADGES = {
  ACCEPTED: {
    label: 'ACCEPTED',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    icon: 'CheckCircle'
  },
  REJECTED: {
    label: 'REJECTED',
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    icon: 'XCircle'
  },
  NEEDS_REVIEW: {
    label: 'NEEDS REVIEW',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    icon: 'AlertCircle'
  }
};
