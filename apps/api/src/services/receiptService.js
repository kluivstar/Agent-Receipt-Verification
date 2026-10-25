import { Repository } from '../db/repository.js';
import { genlayerService } from './genlayerService.js';

export class ReceiptService {
  constructor(repository = null) {
    this.repo = repository || new Repository();
  }

  async getReceipt(id) {
    const receipt = this.repo.getReceiptById(id);
    if (!receipt) return null;

    const task = this.repo.getTaskById(receipt.taskId);
    const submission = this.repo.getSubmissionById(receipt.submissionId);
    const evaluation = this.repo.getEvaluationById(receipt.evaluationId);

    // Run verification assessment
    const isSimulated = receipt.verificationMetadata?.isSimulated || (receipt.transactionHash && receipt.transactionHash.startsWith('0xsim_'));
    let onChainVerification = {
      verified: false,
      statusText: isSimulated ? 'Simulated Execution (Local Validator)' : 'Unverified'
    };

    if (!isSimulated && receipt.transactionHash && receipt.contractAddress) {
      onChainVerification = await genlayerService.verifyOnChainReceipt({
        contractAddress: receipt.contractAddress,
        transactionHash: receipt.transactionHash
      });
    }

    const verificationSummary = {
      applicationRecordFound: true,
      onChainVerified: onChainVerification.verified || false,
      isSimulated,
      evidenceInspected: (submission?.evidenceUrls?.length || 0) > 0,
      evidenceCount: submission?.evidenceUrls?.length || 0,
      checksNote: isSimulated
        ? 'Evaluated via GenLayer Intelligent Contract local equivalence simulator. No mainnet/testnet gas spent.'
        : (onChainVerification.verified 
            ? 'Fully confirmed on GenLayer consensus ledger with validator finalization.' 
            : 'Pending or unconfirmed on public RPC node.')
    };

    return {
      ...receipt,
      task,
      submission,
      evaluation,
      verificationSummary
    };
  }

  listReceipts(filters) {
    return this.repo.listReceipts(filters);
  }

  async exportReceiptJson(id) {
    const full = await this.getReceipt(id);
    if (!full) return null;

    return {
      protocol: 'AgentReceipt-v1.0',
      receiptId: full.id,
      timestamp: full.createdAt,
      decision: full.decision,
      network: full.networkIdentifier,
      contractAddress: full.contractAddress,
      transactionHash: full.transactionHash,
      verificationStatus: full.verificationStatus,
      verificationSummary: full.verificationSummary,
      agreement: {
        taskId: full.task?.id,
        title: full.task?.title,
        requester: full.task?.requester,
        deliverableType: full.task?.deliverableType,
        agreementCommitment: full.agreementCommitment,
        criteria: full.task?.acceptanceCriteria
      },
      submission: {
        submissionId: full.submission?.id,
        submitter: full.submission?.submitter,
        deliverableUrl: full.submission?.deliverableUrl,
        deliverableContent: full.submission?.deliverableContent,
        evidenceUrls: full.submission?.evidenceUrls,
        submissionCommitment: full.submissionCommitment
      },
      evaluation: {
        evaluationId: full.evaluation?.id,
        evaluator: full.evaluation?.evaluationMethod,
        rationale: full.evaluation?.rationale,
        perCriterionResults: full.evaluation?.perCriterionResults,
        confidenceScore: full.evaluation?.confidenceScore,
        contractTxReference: full.evaluation?.contractTxReference
      }
    };
  }
}

export const receiptService = new ReceiptService();
