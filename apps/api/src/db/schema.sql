CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requester TEXT NOT NULL,
  assigned_agent TEXT,
  deliverable_type TEXT NOT NULL,
  deliverable_instructions TEXT NOT NULL,
  acceptance_criteria TEXT NOT NULL,
  evidence_requirements TEXT NOT NULL,
  deadline TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  agreement_commitment TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  submitter TEXT NOT NULL,
  deliverable_url TEXT,
  deliverable_content TEXT,
  summary TEXT NOT NULL,
  evidence_urls TEXT DEFAULT '[]',
  evidence_notes TEXT,
  submission_commitment TEXT NOT NULL,
  metadata TEXT DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  submission_id TEXT NOT NULL,
  evaluation_version INTEGER NOT NULL DEFAULT 1,
  decision TEXT NOT NULL,
  per_criterion_results TEXT NOT NULL,
  rationale TEXT NOT NULL,
  evidence_references TEXT DEFAULT '[]',
  missing_evidence TEXT DEFAULT '[]',
  confidence_score REAL,
  evaluation_method TEXT NOT NULL,
  contract_tx_reference TEXT,
  status TEXT NOT NULL DEFAULT 'COMPLETED',
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  submission_id TEXT NOT NULL,
  evaluation_id TEXT NOT NULL,
  decision TEXT NOT NULL,
  agreement_commitment TEXT NOT NULL,
  submission_commitment TEXT NOT NULL,
  contract_address TEXT,
  network_identifier TEXT NOT NULL,
  transaction_hash TEXT,
  verification_status TEXT NOT NULL,
  verification_metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_requester ON tasks(requester);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_task ON submissions(task_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_task ON evaluations(task_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_sub ON evaluations(submission_id);
CREATE INDEX IF NOT EXISTS idx_receipts_task ON receipts(task_id);
CREATE INDEX IF NOT EXISTS idx_receipts_decision ON receipts(decision);
CREATE INDEX IF NOT EXISTS idx_receipts_created ON receipts(created_at DESC);
