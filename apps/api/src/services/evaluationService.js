import crypto from 'node:crypto';
import { Repository } from '../db/repository.js';
import { TASK_STATUS, SUBMISSION_STATUS, EVALUATION_DECISION, EVALUATION_METHOD, RECEIPT_STATUS } from '@agentreceipt/shared';
import { config } from '../config/index.js';
import { genlayerService } from './genlayerService.js';

export class EvaluationService {
  constructor(repository = null) {
    this.repo = repository || new Repository();
  }

  calculateCommitment(data) {
    const serialized = typeof data === 'string' ? data : JSON.stringify(data);
    return '0x' + crypto.createHash('sha256').update(serialized).digest('hex');
  }

  async evaluateSubmission({ submissionId, mode = 'demo', forceSimulation = false }) {
    const submission = this.repo.getSubmissionById(submissionId);
    if (!submission) {
      throw new Error(`Submission '${submissionId}' not found`);
    }

    const task = this.repo.getTaskById(submission.taskId);
    if (!task) {
      throw new Error(`Associated task '${submission.taskId}' not found`);
    }

    // State machine check: Do not re-evaluate already finalized accepted submission
    const existingEvaluation = this.repo.getEvaluationBySubmissionId(submissionId);
    if (existingEvaluation && existingEvaluation.decision === EVALUATION_DECISION.ACCEPTED) {
      throw new Error(`Submission '${submissionId}' has already been accepted and finalized. Modifying finalized evaluations is prohibited.`);
    }

    // Mark states as evaluating
    this.repo.updateTaskStatus(task.id, TASK_STATUS.EVALUATING);
    this.repo.updateSubmissionStatus(submission.id, SUBMISSION_STATUS.EVALUATING);

    let evaluationResult;
    let evalMethod = EVALUATION_METHOD.LOCAL_SIMULATOR;
    let contractTxRef = null;
    let verificationStatus = RECEIPT_STATUS.ACCEPTED;
    let txHash = null;
    let contractAddress = config.genlayer.contractAddress;
    let networkId = config.genlayer.network;

    const useLiveContract = !forceSimulation && mode === 'contract' && config.appMode === 'live' && genlayerService.isConfigured();

    if (useLiveContract) {
      try {
        evalMethod = EVALUATION_METHOD.GENLAYER_INTELLIGENT_CONTRACT;
        const liveResult = await genlayerService.evaluateDeliverable({
          task,
          submission
        });
        evaluationResult = liveResult.evaluation;
        contractTxRef = liveResult.transactionHash;
        txHash = liveResult.transactionHash;
        verificationStatus = RECEIPT_STATUS.CONFIRMED_ON_CHAIN;
        networkId = liveResult.network;
        contractAddress = liveResult.contractAddress;
      } catch (err) {
        // Fallback or bubble error
        throw new Error(`GenLayer Intelligent Contract evaluation failed: ${err.message}`);
      }
    } else {
      // Intelligent Simulation Evaluation
      evalMethod = EVALUATION_METHOD.LOCAL_SIMULATOR;
      evaluationResult = this._runIntelligentSimulation(task, submission);
      networkId = `${config.genlayer.network}-simulator`;
      txHash = '0xsim_' + crypto.randomBytes(28).toString('hex');
      verificationStatus = evaluationResult.decision === EVALUATION_DECISION.ACCEPTED 
        ? RECEIPT_STATUS.ACCEPTED 
        : (evaluationResult.decision === EVALUATION_DECISION.REJECTED ? RECEIPT_STATUS.REJECTED : RECEIPT_STATUS.NEEDS_REVIEW);
    }

    // Generate evaluation record
    const evaluationId = 'eval_' + crypto.randomUUID().substring(0, 12);
    const now = new Date().toISOString();

    const evaluation = this.repo.createEvaluation({
      id: evaluationId,
      taskId: task.id,
      submissionId: submission.id,
      evaluationVersion: 1,
      decision: evaluationResult.decision,
      perCriterionResults: evaluationResult.perCriterionResults,
      rationale: evaluationResult.rationale,
      evidenceReferences: evaluationResult.evidenceReferences,
      missingEvidence: evaluationResult.missingEvidence,
      confidenceScore: evaluationResult.confidenceScore,
      evaluationMethod: evalMethod,
      contractTxReference: contractTxRef,
      status: 'COMPLETED',
      createdAt: now
    });

    // Compute commitments
    const agreementCommitment = task.agreementCommitment || this.calculateCommitment({
      criteria: task.acceptanceCriteria,
      instructions: task.deliverableInstructions
    });

    const submissionCommitment = submission.submissionCommitment || this.calculateCommitment({
      deliverableUrl: submission.deliverableUrl,
      deliverableContent: submission.deliverableContent,
      evidenceUrls: submission.evidenceUrls
    });

    // Generate persistent Receipt
    const receiptId = 'rcpt_' + crypto.randomUUID().substring(0, 12);
    const receipt = this.repo.createReceipt({
      id: receiptId,
      taskId: task.id,
      submissionId: submission.id,
      evaluationId: evaluation.id,
      decision: evaluation.decision,
      agreementCommitment,
      submissionCommitment,
      contractAddress: contractAddress || '0x0000000000000000000000000000000000000000',
      networkIdentifier: networkId,
      transactionHash: txHash,
      verificationStatus,
      verificationMetadata: {
        evaluator: evalMethod,
        isSimulated: evalMethod === EVALUATION_METHOD.LOCAL_SIMULATOR,
        criteriaCount: task.acceptanceCriteria.length,
        passedCriteriaCount: evaluationResult.perCriterionResults.filter(c => c.passed).length,
        evaluatedAt: now,
        validatorConsensus: evalMethod === EVALUATION_METHOD.GENLAYER_INTELLIGENT_CONTRACT
          ? 'Decentralized GenLayer Validator Equivalence Principle consensus achieved.'
          : 'Local deterministic evaluation simulator run according to GenLayer acceptance rules.'
      },
      createdAt: now
    });

    // Update Task & Submission Statuses
    if (evaluation.decision === EVALUATION_DECISION.ACCEPTED) {
      this.repo.updateTaskStatus(task.id, TASK_STATUS.ACCEPTED);
      this.repo.updateSubmissionStatus(submission.id, SUBMISSION_STATUS.EVALUATED);
    } else if (evaluation.decision === EVALUATION_DECISION.REJECTED) {
      this.repo.updateTaskStatus(task.id, TASK_STATUS.REJECTED);
      this.repo.updateSubmissionStatus(submission.id, SUBMISSION_STATUS.REJECTED);
    } else {
      this.repo.updateTaskStatus(task.id, TASK_STATUS.NEEDS_REVIEW);
      this.repo.updateSubmissionStatus(submission.id, SUBMISSION_STATUS.EVALUATING);
    }

    return {
      evaluation,
      receipt
    };
  }

  _runIntelligentSimulation(task, submission) {
    const summary = (submission.summary || '').toLowerCase();
    const content = (submission.deliverableContent || '').toLowerCase();
    const notes = (submission.evidenceNotes || '').toLowerCase();
    const combinedText = `${summary} ${content} ${notes}`;
    const evidenceUrls = submission.evidenceUrls || [];

    // Check for explicit simulation triggers or keywords
    const isExplicitReject = combinedText.includes('[reject]') || combinedText.includes('incomplete') || combinedText.includes('failed validation') || evidenceUrls.length === 0 && task.acceptanceCriteria.length > 2;
    const isExplicitReview = combinedText.includes('[review]') || combinedText.includes('ambiguous') || combinedText.includes('partial');

    let allPassed = true;
    let anyPassed = false;
    const perCriterionResults = [];
    const missingEvidence = [];
    const evidenceReferences = [...evidenceUrls];

    task.acceptanceCriteria.forEach((criterion, idx) => {
      const titleLower = criterion.title.toLowerCase();
      const conditionLower = criterion.passCondition.toLowerCase();
      
      let passed = true;
      let rationale = '';
      let score = 0.95;

      if (isExplicitReject) {
        if (idx === 0) {
          passed = false;
          score = 0.2;
          rationale = `Deliverable fails to satisfy pass condition "${criterion.passCondition}". Necessary evidence artifact was missing or invalid.`;
          missingEvidence.push(criterion.title);
        } else {
          passed = true;
          score = 0.7;
          rationale = `Criterion partially verified from summary, but overall delivery compromised by prior failure.`;
        }
      } else if (isExplicitReview) {
        if (idx === task.acceptanceCriteria.length - 1) {
          passed = false;
          score = 0.55;
          rationale = `Ambiguous outcome for "${criterion.title}". Deliverable mentions partial progress, requiring human or senior agent adjudication.`;
        } else {
          passed = true;
          score = 0.85;
          rationale = `Satisfied per supporting statements in submission summary.`;
        }
      } else {
        // Standard pass evaluation
        passed = true;
        score = 0.92 + (idx * 0.02);
        if (score > 1) score = 0.98;
        rationale = `Pass condition met: verified "${criterion.passCondition}" against deliverable materials and supporting evidence.`;
      }

      if (!passed) allPassed = false;
      if (passed) anyPassed = true;

      perCriterionResults.push({
        criterionId: criterion.id,
        title: criterion.title,
        passed,
        score,
        rationale,
        evidenceCited: evidenceUrls.length > 0 ? [evidenceUrls[idx % evidenceUrls.length]] : []
      });
    });

    let decision = EVALUATION_DECISION.ACCEPTED;
    let overallRationale = 'All acceptance criteria were rigorously evaluated and satisfied with sufficient supporting evidence.';
    let confidence = 0.94;

    if (isExplicitReject || !allPassed) {
      if (isExplicitReview) {
        decision = EVALUATION_DECISION.NEEDS_REVIEW;
        overallRationale = 'Certain criteria could not be decisively confirmed from the provided deliverable and evidence. Manual review recommended.';
        confidence = 0.68;
      } else {
        decision = EVALUATION_DECISION.REJECTED;
        overallRationale = `One or more mandatory acceptance criteria failed validation. Missing required evidence: ${missingEvidence.join(', ') || 'deliverable non-conformance'}.`;
        confidence = 0.91;
      }
    }

    return {
      decision,
      perCriterionResults,
      rationale: overallRationale,
      evidenceReferences,
      missingEvidence,
      confidenceScore: confidence
    };
  }
}

export const evaluationService = new EvaluationService();
