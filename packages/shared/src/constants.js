export const TASK_STATUS = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  SUBMITTED: 'SUBMITTED',
  EVALUATING: 'EVALUATING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  CANCELLED: 'CANCELLED'
};

export const SUBMISSION_STATUS = {
  PENDING: 'PENDING',
  EVALUATING: 'EVALUATING',
  EVALUATED: 'EVALUATED',
  REJECTED: 'REJECTED'
};

export const EVALUATION_DECISION = {
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  NEEDS_REVIEW: 'NEEDS_REVIEW'
};

export const EVALUATION_METHOD = {
  GENLAYER_INTELLIGENT_CONTRACT: 'GENLAYER_INTELLIGENT_CONTRACT',
  LOCAL_SIMULATOR: 'LOCAL_SIMULATOR'
};

export const RECEIPT_STATUS = {
  PENDING_EVALUATION: 'PENDING_EVALUATION',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  TRANSACTION_PENDING: 'TRANSACTION_PENDING',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  CONFIRMED_ON_CHAIN: 'CONFIRMED_ON_CHAIN'
};

export const DELIVERABLE_TYPES = [
  { id: 'URL_REPORT', label: 'URL / Online Report', placeholder: 'https://example.com/reports/benchmark-q3' },
  { id: 'CODE_REPOSITORY', label: 'Code Repository', placeholder: 'https://github.com/org/repo-audit' },
  { id: 'TEXT_ANALYSIS', label: 'Structured Text / Analysis', placeholder: 'Direct markdown/JSON analysis report' },
  { id: 'DATASET', label: 'Dataset / File Artifact', placeholder: 'https://storage.example.com/datasets/results.csv' },
  { id: 'API_ENDPOINT', label: 'API Endpoint / Spec', placeholder: 'https://api.example.com/v1/health' }
];

export const SUPPORTED_NETWORKS = [
  { id: 'studionet', name: 'GenLayer StudioNet', chainId: 101, rpcUrl: 'https://studio.genlayer.com/api' },
  { id: 'testnetBradbury', name: 'GenLayer Bradbury Testnet', chainId: 102, rpcUrl: 'https://bradbury.genlayer.com/api' },
  { id: 'testnetAsimov', name: 'GenLayer Asimov Testnet', chainId: 103, rpcUrl: 'https://asimov.genlayer.com/api' },
  { id: 'localnet', name: 'GenLayer Localnet (Simulator)', chainId: 999, rpcUrl: 'http://localhost:8545' }
];
