import { getDatabase } from './index.js';

export class Repository {
  constructor(db = null) {
    this.db = db || getDatabase();
  }

  // --- TASKS ---

  createTask(task) {
    const stmt = this.db.prepare(`
      INSERT INTO tasks (
        id, title, description, requester, assigned_agent,
        deliverable_type, deliverable_instructions, acceptance_criteria,
        evidence_requirements, deadline, status, agreement_commitment,
        metadata, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      )
    `);

    stmt.run(
      task.id,
      task.title,
      task.description,
      task.requester,
      task.assignedAgent || null,
      task.deliverableType,
      task.deliverableInstructions,
      JSON.stringify(task.acceptanceCriteria),
      task.evidenceRequirements,
      task.deadline || null,
      task.status || 'OPEN',
      task.agreementCommitment,
      JSON.stringify(task.metadata || {}),
      task.createdAt,
      task.updatedAt
    );

    return this.getTaskById(task.id);
  }

  getTaskById(id) {
    const stmt = this.db.prepare('SELECT * FROM tasks WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this._formatTask(row);
  }

  listTasks({ status, search, requester, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = {}) {
    let whereClauses = [];
    let params = [];

    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }
    if (requester) {
      whereClauses.push('requester = ?');
      params.push(requester);
    }
    if (search) {
      whereClauses.push('(title LIKE ? OR description LIKE ? OR id LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const safeSortBy = ['created_at', 'updated_at', 'deadline', 'title'].includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countStmt = this.db.prepare(`SELECT COUNT(*) as total FROM tasks ${where}`);
    const { total } = countStmt.get(...params);

    const offset = (page - 1) * limit;
    const listStmt = this.db.prepare(`
      SELECT * FROM tasks
      ${where}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `);

    const rows = listStmt.all(...params, limit, offset);
    return {
      items: rows.map(r => this._formatTask(r)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  updateTaskStatus(id, status) {
    const stmt = this.db.prepare(`
      UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?
    `);
    const now = new Date().toISOString();
    stmt.run(status, now, id);
    return this.getTaskById(id);
  }

  getTaskMetrics() {
    const totalStmt = this.db.prepare('SELECT COUNT(*) as total FROM tasks');
    const { total } = totalStmt.get();

    const byStatusStmt = this.db.prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status');
    const byStatusRows = byStatusStmt.all();

    const counts = {
      total,
      OPEN: 0,
      ASSIGNED: 0,
      SUBMITTED: 0,
      EVALUATING: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      NEEDS_REVIEW: 0,
      CANCELLED: 0
    };

    for (const r of byStatusRows) {
      counts[r.status] = r.count;
    }

    const receiptCountStmt = this.db.prepare('SELECT COUNT(*) as totalReceipts FROM receipts');
    const { totalReceipts } = receiptCountStmt.get();

    const verifiedOnChainStmt = this.db.prepare("SELECT COUNT(*) as verifiedOnChain FROM receipts WHERE verification_status = 'CONFIRMED_ON_CHAIN'");
    const { verifiedOnChain } = verifiedOnChainStmt.get();

    return {
      ...counts,
      totalReceipts,
      verifiedOnChain
    };
  }

  // --- SUBMISSIONS ---

  createSubmission(submission) {
    const stmt = this.db.prepare(`
      INSERT INTO submissions (
        id, task_id, submitter, deliverable_url, deliverable_content,
        summary, evidence_urls, evidence_notes, submission_commitment,
        metadata, status, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    stmt.run(
      submission.id,
      submission.taskId,
      submission.submitter,
      submission.deliverableUrl || null,
      submission.deliverableContent || null,
      submission.summary,
      JSON.stringify(submission.evidenceUrls || []),
      submission.evidenceNotes || null,
      submission.submissionCommitment,
      JSON.stringify(submission.metadata || {}),
      submission.status || 'PENDING',
      submission.createdAt,
      submission.updatedAt
    );

    return this.getSubmissionById(submission.id);
  }

  getSubmissionById(id) {
    const stmt = this.db.prepare('SELECT * FROM submissions WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this._formatSubmission(row);
  }

  getSubmissionsByTaskId(taskId) {
    const stmt = this.db.prepare('SELECT * FROM submissions WHERE task_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(taskId);
    return rows.map(r => this._formatSubmission(r));
  }

  updateSubmissionStatus(id, status) {
    const stmt = this.db.prepare('UPDATE submissions SET status = ?, updated_at = ? WHERE id = ?');
    const now = new Date().toISOString();
    stmt.run(status, now, id);
    return this.getSubmissionById(id);
  }

  // --- EVALUATIONS ---

  createEvaluation(evaluation) {
    const stmt = this.db.prepare(`
      INSERT INTO evaluations (
        id, task_id, submission_id, evaluation_version,
        decision, per_criterion_results, rationale,
        evidence_references, missing_evidence, confidence_score,
        evaluation_method, contract_tx_reference, status, created_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?, ?
      )
    `);

    stmt.run(
      evaluation.id,
      evaluation.taskId,
      evaluation.submissionId,
      evaluation.evaluationVersion || 1,
      evaluation.decision,
      JSON.stringify(evaluation.perCriterionResults || []),
      evaluation.rationale,
      JSON.stringify(evaluation.evidenceReferences || []),
      JSON.stringify(evaluation.missingEvidence || []),
      evaluation.confidenceScore ?? null,
      evaluation.evaluationMethod,
      evaluation.contractTxReference || null,
      evaluation.status || 'COMPLETED',
      evaluation.createdAt
    );

    return this.getEvaluationById(evaluation.id);
  }

  getEvaluationById(id) {
    const stmt = this.db.prepare('SELECT * FROM evaluations WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this._formatEvaluation(row);
  }

  getEvaluationsByTaskId(taskId) {
    const stmt = this.db.prepare('SELECT * FROM evaluations WHERE task_id = ? ORDER BY created_at DESC');
    const rows = stmt.all(taskId);
    return rows.map(r => this._formatEvaluation(r));
  }

  getEvaluationBySubmissionId(submissionId) {
    const stmt = this.db.prepare('SELECT * FROM evaluations WHERE submission_id = ? ORDER BY created_at DESC LIMIT 1');
    const row = stmt.get(submissionId);
    if (!row) return null;
    return this._formatEvaluation(row);
  }

  // --- RECEIPTS ---

  createReceipt(receipt) {
    const stmt = this.db.prepare(`
      INSERT INTO receipts (
        id, task_id, submission_id, evaluation_id,
        decision, agreement_commitment, submission_commitment,
        contract_address, network_identifier, transaction_hash,
        verification_status, verification_metadata, created_at
      ) VALUES (
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?
      )
    `);

    stmt.run(
      receipt.id,
      receipt.taskId,
      receipt.submissionId,
      receipt.evaluationId,
      receipt.decision,
      receipt.agreementCommitment,
      receipt.submissionCommitment,
      receipt.contractAddress || null,
      receipt.networkIdentifier,
      receipt.transactionHash || null,
      receipt.verificationStatus,
      JSON.stringify(receipt.verificationMetadata || {}),
      receipt.createdAt
    );

    return this.getReceiptById(receipt.id);
  }

  getReceiptById(id) {
    const stmt = this.db.prepare('SELECT * FROM receipts WHERE id = ?');
    const row = stmt.get(id);
    if (!row) return null;
    return this._formatReceipt(row);
  }

  getReceiptByTaskId(taskId) {
    const stmt = this.db.prepare('SELECT * FROM receipts WHERE task_id = ? ORDER BY created_at DESC LIMIT 1');
    const row = stmt.get(taskId);
    if (!row) return null;
    return this._formatReceipt(row);
  }

  listReceipts({ decision, verificationStatus, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'desc' } = {}) {
    let whereClauses = [];
    let params = [];

    if (decision) {
      whereClauses.push('decision = ?');
      params.push(decision);
    }
    if (verificationStatus) {
      whereClauses.push('verification_status = ?');
      params.push(verificationStatus);
    }

    const where = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const safeSortBy = ['created_at', 'decision', 'verification_status'].includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const countStmt = this.db.prepare(`SELECT COUNT(*) as total FROM receipts ${where}`);
    const { total } = countStmt.get(...params);

    const offset = (page - 1) * limit;
    const listStmt = this.db.prepare(`
      SELECT * FROM receipts
      ${where}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `);

    const rows = listStmt.all(...params, limit, offset);
    return {
      items: rows.map(r => this._formatReceipt(r)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // --- HELPERS ---

  _formatTask(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      requester: row.requester,
      assignedAgent: row.assigned_agent,
      deliverableType: row.deliverable_type,
      deliverableInstructions: row.deliverable_instructions,
      acceptanceCriteria: JSON.parse(row.acceptance_criteria || '[]'),
      evidenceRequirements: row.evidence_requirements,
      deadline: row.deadline,
      status: row.status,
      agreementCommitment: row.agreement_commitment,
      metadata: JSON.parse(row.metadata || '{}'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  _formatSubmission(row) {
    return {
      id: row.id,
      taskId: row.task_id,
      submitter: row.submitter,
      deliverableUrl: row.deliverable_url,
      deliverableContent: row.deliverable_content,
      summary: row.summary,
      evidenceUrls: JSON.parse(row.evidence_urls || '[]'),
      evidenceNotes: row.evidence_notes,
      submissionCommitment: row.submission_commitment,
      metadata: JSON.parse(row.metadata || '{}'),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  _formatEvaluation(row) {
    return {
      id: row.id,
      taskId: row.task_id,
      submissionId: row.submission_id,
      evaluationVersion: row.evaluation_version,
      decision: row.decision,
      perCriterionResults: JSON.parse(row.per_criterion_results || '[]'),
      rationale: row.rationale,
      evidenceReferences: JSON.parse(row.evidence_references || '[]'),
      missingEvidence: JSON.parse(row.missing_evidence || '[]'),
      confidenceScore: row.confidence_score,
      evaluationMethod: row.evaluation_method,
      contractTxReference: row.contract_tx_reference,
      status: row.status,
      createdAt: row.created_at
    };
  }

  _formatReceipt(row) {
    return {
      id: row.id,
      taskId: row.task_id,
      submissionId: row.submission_id,
      evaluationId: row.evaluation_id,
      decision: row.decision,
      agreementCommitment: row.agreement_commitment,
      submissionCommitment: row.submission_commitment,
      contractAddress: row.contract_address,
      networkIdentifier: row.network_identifier,
      transactionHash: row.transaction_hash,
      verificationStatus: row.verification_status,
      verificationMetadata: JSON.parse(row.verification_metadata || '{}'),
      createdAt: row.created_at
    };
  }
}
